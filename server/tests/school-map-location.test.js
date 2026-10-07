import assert from "node:assert/strict";
import { after, before, beforeEach, describe, test } from "node:test";
import { PASSWORD, createAdmin, createClient, donorData, login, ngoData, registerActive, schoolData, startTestServer } from "./helpers.js";
import { checkDeviceLocation, googleMapsUrl, readMapLink } from "../../shared/mapLocationRules.js";

const { setMapLinkFetch } = await import("../services/mapLinks.js");

// A stand-in for Google's short-link service: each short link answers with a redirect from this table.
// No request ever leaves the machine. `requested` lists every address the server asked for.
const requested = [];
let redirects = {};
let failNetwork = false;
const fakeShortLinks = async (url) => {
    requested.push(url);
    if (failNetwork) throw new TypeError("fetch failed");
    const location = redirects[url];
    return location ? new Response(null, { status: 302, headers: { Location: location } }) : new Response("Not found", { status: 404 });
};

const UDUPI_PLACE =
    "https://www.google.com/maps/place/Govt.+Higher+Primary+School/@13.3401,74.7400,17z/data=!3m1!4b1!4m6!3m5!1s0x3bbcbb:0x9a!8m2!3d13.3409123!4d74.7421456!16s";
const UDUPI = { lat: 13.340912, lng: 74.742146 };

let server;
let admin;
let User;
let SchoolProfile;
const newClient = () => createClient(server.baseUrl);
const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

const signedIn = async (factory, role, overrides) => {
    const data = factory(overrides);
    await registerActive(newClient(), data);
    const c = newClient();
    assert.equal((await login(c, data.email, PASSWORD, role)).status, 200);
    const id = (await User.findOne({ email: data.email.toLowerCase() }))._id.toString();
    return { c, data, id };
};
const signedInSchool = (overrides) => signedIn(schoolData, "school", overrides);
const saveLink = (c, link) => c.put("/api/profile/map-location", { json: { source: "LINK", link } });
const saveDevice = (c, fields) => c.put("/api/profile/map-location", { json: { source: "DEVICE", ...fields } });
const resolve = (c, link) => c.post("/api/profile/map-location/resolve", { json: { link } });
const stored = async (id) => (await SchoolProfile.findOne({ userId: id }).lean()).mapLocation;

before(async () => {
    setMapLinkFetch(fakeShortLinks);
    server = await startTestServer();
    User = (await import("../models/User.js")).default;
    SchoolProfile = (await import("../models/SchoolProfile.js")).default;
    const credentials = await createAdmin();
    admin = newClient();
    assert.equal((await login(admin, credentials.email, PASSWORD, "admin")).status, 200);
});
after(async () => {
    setMapLinkFetch(null);
    await server.stop();
});
beforeEach(() => {
    requested.length = 0;
    redirects = {};
    failNetwork = false;
});

describe("reading Google Maps links (shared rules)", () => {
    test("the coordinates come from every common Google Maps link format", () => {
        const cases = [
            // A place: its own pin (!3d…!4d…) wins over the map's centre (@…).
            [UDUPI_PLACE, UDUPI],
            ["https://www.google.com/maps/@12.9716,77.5946,15z", { lat: 12.9716, lng: 77.5946 }],
            ["https://maps.google.com/?q=12.9716,77.5946", { lat: 12.9716, lng: 77.5946 }],
            ["https://maps.google.com/maps?ll=12.9716,77.5946&z=15", { lat: 12.9716, lng: 77.5946 }],
            ["https://www.google.com/maps/search/?api=1&query=12.9716%2C77.5946", { lat: 12.9716, lng: 77.5946 }],
            ["https://www.google.com/maps/search/12.971599,+77.594566?entry=tts", { lat: 12.971599, lng: 77.594566 }],
            ["https://www.google.co.in/maps/place/12.9716,77.5946", { lat: 12.9716, lng: 77.5946 }],
            ["  12.9716, 77.5946 ", { lat: 12.9716, lng: 77.5946 }],
        ];
        for (const [link, expected] of cases) assert.deepEqual(readMapLink(link), { value: expected }, link);
    });

    test("short share links are recognised (the server opens them); other links are refused", () => {
        assert.deepEqual(readMapLink("https://maps.app.goo.gl/AbC123xyz?g_st=ic"), { shortLink: "https://maps.app.goo.gl/AbC123xyz" });
        assert.deepEqual(readMapLink("https://goo.gl/maps/AbC123"), { shortLink: "https://goo.gl/maps/AbC123" });
        for (const link of [
            "https://www.google.com.evil.example/maps/@12.97,77.59,15z",
            "https://evilgoogle.com/maps/@12.97,77.59,15z",
            "https://www.google.com/search?q=12.97,77.59",
            "https://goo.gl/AbC123",
            "https://user:pass@www.google.com/maps/@12.97,77.59,15z",
            "https://maps.google.com:8443/?q=12.97,77.59",
            "javascript:alert(1)",
            "ftp://maps.google.com/?q=12.97,77.59",
            "not a link",
            "",
        ]) {
            assert.ok(readMapLink(link).error, link);
        }
    });

    test("a link without coordinates, or a place outside India, gets a clear message", () => {
        assert.match(readMapLink("https://maps.google.com/?q=Govt+School+Udupi&ftid=0x3bbc:0x1").error, /drop a pin/);
        assert.match(readMapLink("https://www.google.com/maps/@51.5074,-0.1278,15z").error, /outside India/);
        assert.match(readMapLink("77.5946, 12.9716").error, /outside India/, "swapped numbers");
    });

    test("device locations must be precise to 1 km; Open in Google Maps uses Google's documented URL", () => {
        assert.deepEqual(checkDeviceLocation({ lat: 13.3409123, lng: 74.7421456, accuracy: 18.6 }), { value: { ...UDUPI, accuracy: 19 } });
        assert.match(checkDeviceLocation({ lat: 13.34, lng: 74.74, accuracy: 5000 }).error, /about 5 km/);
        assert.ok(checkDeviceLocation({ lat: 13.34, lng: 74.74 }).error, "accuracy is required");
        assert.equal(googleMapsUrl(UDUPI), "https://www.google.com/maps/search/?api=1&query=13.340912,74.742146");
    });
});

describe("POST /api/profile/map-location/resolve and short links", () => {
    test("a full link is read without any request; a short link is opened once and read from where it leads", async () => {
        const { c } = await signedInSchool();
        const full = await resolve(c, UDUPI_PLACE);
        assert.equal(full.status, 200);
        assert.deepEqual(full.body, { location: UDUPI });
        assert.equal(requested.length, 0, "a full link needs no request");

        redirects = { "https://maps.app.goo.gl/Udupi1": UDUPI_PLACE };
        const short = await resolve(c, "https://maps.app.goo.gl/Udupi1?g_st=ic");
        assert.equal(short.status, 200, JSON.stringify(short.body));
        assert.deepEqual(short.body, { location: UDUPI });
        assert.deepEqual(requested, ["https://maps.app.goo.gl/Udupi1"], "only the short link itself is requested, never Google Maps");
    });

    test("a chain of short links is followed (only Google's short-link hosts are ever requested)", async () => {
        const { c } = await signedInSchool();
        redirects = {
            "https://maps.app.goo.gl/Hop1": "https://goo.gl/maps/Hop2",
            "https://goo.gl/maps/Hop2": "https://maps.google.com/?q=13.3409,74.7421",
        };
        const res = await resolve(c, "https://maps.app.goo.gl/Hop1");
        assert.deepEqual(res.body, { location: { lat: 13.3409, lng: 74.7421 } });
        assert.deepEqual(requested, ["https://maps.app.goo.gl/Hop1", "https://goo.gl/maps/Hop2"]);
    });

    test("a short link that leads anywhere but Google Maps is refused, and that address is never requested", async () => {
        const { c } = await signedInSchool();
        for (const target of ["http://169.254.169.254/latest/meta-data/", "http://localhost:5000/api/admin/accounts", "https://evil.example/maps/@12.9,77.5,15z", "file:///etc/passwd"]) {
            requested.length = 0;
            redirects = { "https://maps.app.goo.gl/Bad": target };
            const res = await resolve(c, "https://maps.app.goo.gl/Bad");
            assert.equal(res.status, 400, target);
            assert.match(res.body.message, /doesn't lead to Google Maps/, target);
            assert.deepEqual(requested, ["https://maps.app.goo.gl/Bad"], target);
        }
    });

    test("short links that lead to a place with no coordinates, are broken, loop or can't be reached", async () => {
        const { c } = await signedInSchool();
        redirects = { "https://maps.app.goo.gl/NoPin": "https://maps.google.com/?q=Govt+School+Udupi&ftid=0x3bbc:0x1&entry=gps" };
        const noPin = await resolve(c, "https://maps.app.goo.gl/NoPin");
        assert.equal(noPin.status, 400);
        assert.match(noPin.body.errors.link, /drop a pin/);

        const broken = await resolve(c, "https://maps.app.goo.gl/Missing");
        assert.equal(broken.status, 400);
        assert.match(broken.body.message, /couldn't open this link/);

        requested.length = 0;
        redirects = { "https://maps.app.goo.gl/Loop": "https://maps.app.goo.gl/Loop" };
        assert.equal((await resolve(c, "https://maps.app.goo.gl/Loop")).status, 400);
        assert.equal(requested.length, 5, "gives up after 5 redirects");

        failNetwork = true;
        const offline = await resolve(c, "https://maps.app.goo.gl/Udupi1");
        assert.equal(offline.status, 502);
        assert.match(offline.body.message, /couldn't open this link/);
    });
});

describe("PUT / DELETE /api/profile/map-location", () => {
    test("save from a link: the server reads the coordinates itself; the school's profile shows them", async () => {
        const { c, id } = await signedInSchool();
        const res = await saveLink(c, UDUPI_PLACE);
        assert.equal(res.status, 200, JSON.stringify(res.body));
        assert.equal(res.body.message, "Your school's location on the map is saved.");
        assert.deepEqual({ ...res.body.mapLocation, setAt: undefined }, { ...UDUPI, source: "LINK", accuracy: null, setAt: undefined });

        const me = await c.get("/api/profile/me");
        assert.deepEqual(me.body.profile.mapLocation, res.body.mapLocation);
        const saved = await stored(id);
        assert.deepEqual({ lat: saved.lat, lng: saved.lng, source: saved.source }, { ...UDUPI, source: "LINK" });
        assert.ok(saved.setAt instanceof Date);
        assert.ok(!("link" in saved), "the link itself is not kept");
    });

    test("save from the device: precise enough is saved with its accuracy; too vague is refused", async () => {
        const { c, id } = await signedInSchool();
        const ok = await saveDevice(c, { lat: 13.3409123, lng: 74.7421456, accuracy: 18.6 });
        assert.equal(ok.status, 200, JSON.stringify(ok.body));
        assert.deepEqual({ ...ok.body.mapLocation, setAt: undefined }, { ...UDUPI, source: "DEVICE", accuracy: 19, setAt: undefined });

        const vague = await saveDevice(c, { lat: 12.97, lng: 77.59, accuracy: 4200 });
        assert.equal(vague.status, 400);
        assert.match(vague.body.errors.location, /about 4 km/);
        assert.equal((await stored(id)).lat, UDUPI.lat, "the earlier location is kept");
    });

    test("bad input is refused and changes nothing", async () => {
        const { c, id } = await signedInSchool();
        assert.equal((await saveLink(c, UDUPI_PLACE)).status, 200);
        const other = await signedInSchool();
        for (const body of [
            { source: "LINK", link: "https://evil.example/maps/@12.9,77.5,15z" },
            { source: "LINK", link: "https://www.google.com/maps/@51.5074,-0.1278,15z" },
            { source: "LINK" },
            // A link's coordinates come from the link, never from the browser.
            { source: "LINK", link: UDUPI_PLACE, lat: 28.6, lng: 77.2 },
            { source: "DEVICE", lat: 13.34, lng: 74.74 },
            { source: "DEVICE", lat: 51.5, lng: -0.12, accuracy: 10 },
            { source: "DEVICE", lat: "13.34", lng: "74.74", accuracy: 10 },
            { source: "DEVICE", lat: 13.34, lng: 74.74, accuracy: 10, userId: other.id },
            { source: "DEVICE", lat: 13.34, lng: 74.74, accuracy: 10, setAt: "2020-01-01" },
            { source: "MANUAL", lat: 13.34, lng: 74.74 },
            {},
        ]) {
            const res = await c.put("/api/profile/map-location", { json: body });
            assert.equal(res.status, 400, JSON.stringify(body));
        }
        assert.equal((await c.put("/api/profile/map-location", { json: [] })).status, 400);
        const saved = await stored(id);
        assert.deepEqual({ lat: saved.lat, lng: saved.lng, source: saved.source }, { ...UDUPI, source: "LINK" });
        assert.equal(await stored(other.id), undefined, "another school is untouched");
    });

    test("remove: the location is gone from the profile", async () => {
        const { c, id } = await signedInSchool();
        assert.equal((await saveLink(c, UDUPI_PLACE)).status, 200);
        const res = await c.delete("/api/profile/map-location");
        assert.equal(res.status, 200);
        assert.equal(res.body.mapLocation, null);
        assert.equal(await stored(id), undefined);
        assert.equal((await c.get("/api/profile/me")).body.profile.mapLocation, null);
    });

    test("only a signed-in school can set or remove its location", async () => {
        const ngo = (await signedIn(ngoData, "ngo")).c;
        const donor = (await signedIn(donorData, "donor")).c;
        for (const [who, c, expected] of [["ngo", ngo, 403], ["donor", donor, 403], ["admin", admin, 403], ["signed out", newClient(), 401]]) {
            assert.equal((await resolve(c, UDUPI_PLACE)).status, expected, `${who} resolve`);
            assert.equal((await saveLink(c, UDUPI_PLACE)).status, expected, `${who} save`);
            assert.equal((await c.delete("/api/profile/map-location")).status, expected, `${who} remove`);
        }
    });
});

describe("who can see it", () => {
    test("NGOs, donors and the public never get it; admins see it in account and project review", async () => {
        const school = await signedInSchool({ schoolName: "Govt. Higher Primary School, Kadiyali", district: "Udupi", state: "Karnataka" });
        assert.equal((await saveLink(school.c, UDUPI_PLACE)).status, 200);
        const project = (
            await school.c.post("/api/school/projects", {
                json: { title: "Smart classroom", category: "Digital Learning", priority: "High", budget: "100000", studentsBenefited: "85", expectedCompletion: inDays(90), problem: "Class 6 and 7 have no projector, so science is taught only from the textbook." },
            })
        ).body.project;
        assert.equal((await admin.patch(`/api/admin/projects/${project.id}/approve`)).status, 200);
        const ngo = (await signedIn(ngoData, "ngo")).c;
        const donor = (await signedIn(donorData, "donor")).c;
        assert.equal((await ngo.post(`/api/projects/${project.id}/commitments`, { json: { parts: [1] } })).status, 201);

        const leaks = (body) => {
            const text = JSON.stringify(body);
            return text.includes("mapLocation") || text.includes(String(UDUPI.lat)) || text.includes(String(UDUPI.lng));
        };
        for (const [what, res] of [
            ["NGO needs list", await ngo.get("/api/projects")],
            ["NGO commitments", await ngo.get("/api/projects/committed")],
            ["NGO payment details", await ngo.get(`/api/projects/${project.id}/payment-details`)],
            ["donor needs list", await donor.get("/api/projects")],
            ["public project page", await newClient().get(`/api/public/projects/${project.id}`)],
        ]) {
            assert.equal(res.status, 200, what);
            assert.ok(!leaks(res.body), `${what} shows the school's map location`);
        }

        const account = await admin.get(`/api/admin/accounts/${school.id}`);
        assert.deepEqual({ lat: account.body.profile.mapLocation.lat, lng: account.body.profile.mapLocation.lng }, UDUPI);
        const review = await admin.get(`/api/admin/projects/${project.id}`);
        assert.deepEqual(review.body.project.school.mapLocation, UDUPI);
    });
});
