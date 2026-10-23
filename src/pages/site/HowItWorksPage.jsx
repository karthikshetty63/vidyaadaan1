import FinalCta from "../../components/home/FinalCta";
import HowItWorks from "../../components/home/HowItWorks";
import { readPath } from "../../components/home/paths";
import SitePage from "../../components/home/SitePage";

/** /how-it-works: the workflow, step by step, and how the 5-part funding adds up. */
const HowItWorksPage = () => (
  <SitePage title="How it works">
    <HowItWorks />
    <FinalCta path={readPath()} />
  </SitePage>
);

export default HowItWorksPage;
