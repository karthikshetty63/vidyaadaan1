import FinalCta from "../../components/home/FinalCta";
import NeedsBoard from "../../components/home/NeedsBoard";
import { readPath } from "../../components/home/paths";
import SitePage from "../../components/home/SitePage";

/** /needs: every approved school need still open for support, with filters, search and "Show more". */
const NeedsPage = () => (
  <SitePage title="School needs">
    <NeedsBoard />
    <FinalCta path={readPath()} showNeedsLink={false} />
  </SitePage>
);

export default NeedsPage;
