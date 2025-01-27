import SignupClient from "./signup-client";

export const dynamic = "force-static";

const Signup = () => {
  return (
    <div className="container relative flex min-h-[calc(100vh-57px)] items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <SignupClient />
      </div>
    </div>
  );
};

export default Signup;
