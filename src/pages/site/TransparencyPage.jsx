import FinalCta from "../../components/home/FinalCta";
import { readPath } from "../../components/home/paths";
import SitePage from "../../components/home/SitePage";
import Transparency from "../../components/home/Transparency";

/** /transparency: what is public and private, how the team reviews, what "raised" means, recent activity. */
const TransparencyPage = () => (
  <SitePage title="Transparency">
    <Transparency />
    <FinalCta path={readPath()} />
  </SitePage>
);

export default TransparencyPage;
