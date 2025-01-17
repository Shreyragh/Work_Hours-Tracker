import ProtectedNavbar from "@/components/layout/protected-navbar";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ProtectedNavbar />
      {children}
    </>
  );
};

export default ProtectedLayout;
