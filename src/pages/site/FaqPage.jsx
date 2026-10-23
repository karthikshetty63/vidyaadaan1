import { useState } from "react";
import FinalCta from "../../components/home/FinalCta";
import HomeFaq from "../../components/home/HomeFaq";
import { readPath } from "../../components/home/paths";
import SitePage from "../../components/home/SitePage";

/** /faq: the questions, those for the visitor's chosen path (Take part page) first. */
const FaqPage = () => {
  const [path] = useState(readPath);
  return (
    <SitePage title="Questions">
      <HomeFaq path={path} />
      <FinalCta path={path} />
    </SitePage>
  );
};

export default FaqPage;
