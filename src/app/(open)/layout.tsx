import OpenNavbar from "@/components/layout/open-navbar";

const OpenLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <OpenNavbar />
      {children}
    </>
  );
};

export default OpenLayout;
