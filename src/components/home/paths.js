import { LuGraduationCap, LuHeart, LuSchool, LuUsers } from "react-icons/lu";

// The home page's "Choose your path": what each kind of visitor does on VIDYADAAN. Every line describes the
// app as it works today. Online payments run in test mode for now, so nothing here promises real online giving.

export const PATHS = {
  school: {
    label: "School",
    audience: "For schools",
    who: "Principals and staff of government schools",
    title: "Get your school's needs funded",
    steps: [
      "Register your school with its documents, bank details and a verified email.",
      "Our team checks your school. Then sign in with your email or 11-digit UDISE code.",
      "Post a need: what's wrong, the budget and how many students it helps. The team reviews it.",
      "Once approved, NGOs and donors can fund it, your alumni get an email, and you accept payments as they reach your bank.",
    ],
    haveReady: ["School registration certificate", "Principal's ID proof", "Bank account number and IFSC"],
    primary: { label: "Register your school", to: "/join/school" },
    secondary: { label: "School sign in", to: "/login/school" },
    faq: [
      ["How long does approval take?", "There's no fixed time: a person from the VIDYADAAN team checks every registration and every project. Try signing in after a while; the sign-in page says if your account is still pending."],
      ["Can I change a project after sending it?", "Yes. While it waits for review, edit it any time. If the team asks for changes, fix them and resubmit. After approval you can update its status, but not the budget once funding has started."],
      ["Who can see my bank details?", "Only NGOs that commit to one of your approved projects, so they can pay your school directly, and the VIDYADAAN team. Donors never see them."],
    ],
  },
  ngo: {
    label: "NGO",
    audience: "For NGOs",
    who: "Registered NGOs, trusts and societies",
    title: "Fund verified needs, one part at a time",
    steps: [
      "Register your NGO with its registration certificate and PAN.",
      "Our team checks it. You'll get an email whenever a new school need is approved.",
      "Commit to one or more of a need's 5 equal parts, or all of them.",
      "Pay the school directly and upload the proof. The school confirms the money arrived, and the need's progress updates.",
    ],
    haveReady: ["Registration certificate", "PAN card", "Registration number and date"],
    primary: { label: "Register your NGO", to: "/join/ngo" },
    secondary: { label: "NGO sign in", to: "/login/ngo" },
    faq: [
      ["Do we have to fund a whole project?", "No. Every budget is split into 5 equal parts, so you can take one part, a few, or all of them. Parts you haven't paid for can be withdrawn."],
      ["How does the school know we paid?", "When you pay a school directly, you record the payment with its proof (challan, receipt or screenshot). The school checks its bank account and accepts it, or rejects it with a reason."],
      ["Can we track our work?", "Yes. Your dashboard follows every need you fund, your payments and volunteers, and you can download a report."],
    ],
  },
  donor: {
    label: "Donor",
    audience: "For donors",
    who: "Individuals who want to help",
    title: "Give to a specific, verified need",
    steps: [
      "Create a donor account with your PAN card.",
      "Our team checks it before your first sign-in.",
      "Choose an approved need: you see the school, the problem and how much is still needed.",
      "Give, and follow the need's progress. Your donations are listed in your dashboard, with a downloadable report.",
    ],
    haveReady: ["PAN card"],
    primary: { label: "Create a donor account", to: "/join/donor" },
    secondary: { label: "Donor sign in", to: "/login/donor" },
    note: "Online giving is being tested: payments made now are test payments, and no real money is charged.",
    faq: [
      ["Do I get an 80G tax receipt?", "No. VIDYADAAN is not a registered charity, so donations aren't eligible for an 80G deduction."],
      ["Will the school see my name?", "No. Schools and visitors see only the total raised for each need, never donors' names."],
      ["How do I know the money is counted honestly?", "A need's “raised” amount counts only confirmed money: NGO payments the school accepted and online payments the server verified."],
    ],
  },
  alumni: {
    label: "Former student",
    audience: "For former students",
    who: "Alumni of a government school",
    title: "Help the school you studied at",
    steps: [
      "You don't need an account: your school adds you to its alumni list.",
      "When the VIDYADAAN team approves one of your school's projects, you get an email about it.",
      "Open the project, share it on WhatsApp with your batchmates, or create a donor account to give.",
    ],
    haveReady: [],
    primary: { label: "See open needs", to: "/#needs" },
    secondary: { label: "Create a donor account", to: "/join/donor" },
    faq: [
      ["Why did I get an email about a project?", "Your school added you to its alumni list on VIDYADAAN, and one of its projects was just approved."],
      ["How do I stop these emails?", "Ask your school to remove you from its alumni list or mark you inactive. No one else sees your email address."],
      ["Is the project genuine?", "Every school on VIDYADAAN was verified by our team, and every project was reviewed before it was published."],
    ],
  },
};

export const PATH_ORDER = ["school", "ngo", "donor", "alumni"];

// Each path's icon and colour (the same colours as the sign-in pages).
export const PATH_LOOK = {
  school: { icon: LuSchool, tint: "bg-blue-50 text-blue-600", ring: "border-blue-500 ring-blue-500" },
  ngo: { icon: LuUsers, tint: "bg-emerald-50 text-emerald-600", ring: "border-emerald-500 ring-emerald-500" },
  donor: { icon: LuHeart, tint: "bg-violet-50 text-violet-600", ring: "border-violet-500 ring-violet-500" },
  alumni: { icon: LuGraduationCap, tint: "bg-amber-50 text-amber-600", ring: "border-amber-500 ring-amber-500" },
};

/** Questions everyone asks, whatever their path. */
export const COMMON_FAQ = [
  ["Is VIDYADAAN free?", "Yes. There is no fee for schools, NGOs or donors, and nothing is deducted from the money a school receives."],
  ["How do you check schools and projects?", "Every school, NGO and donor registers with documents that a person from our team checks before the account can be used. Every project is reviewed before NGOs and donors can see it."],
  ["Where does the money go?", "When an NGO pays a school directly, the money goes straight to the school's bank account. A need's “raised” amount counts only money the school accepted or the server verified."],
  ["Can I give online today?", "Online giving is being tested. Payments made now are test payments and no real money is charged. NGOs can already pay schools directly."],
];
