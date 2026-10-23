import { useState } from "react";
import PathPanel from "../../components/home/PathPanel";
import { readPath, savePath } from "../../components/home/paths";
import SitePage from "../../components/home/SitePage";

/** /take-part: School, NGO, Donor or Former student, with each one's steps. The choice is remembered on this device. */
const TakePartPage = () => {
  const [path, setPath] = useState(readPath);
  const choose = (next) => {
    setPath(next);
    savePath(next);
  };
  return (
    <SitePage title="Ways to take part">
      <PathPanel path={path} onChoose={choose} />
    </SitePage>
  );
};

export default TakePartPage;
