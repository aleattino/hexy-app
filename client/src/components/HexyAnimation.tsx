import { XlviLoader } from "react-awesome-loaders";

export default function HexyAnimation() {
  return (
    <div className="mb-8">
      <XlviLoader
        boxColors={["#EF4444", "#F59E0B", "#6366F1"]}
        desktopSize={"96px"}
        mobileSize={"80px"}
      />
    </div>
  );
}

