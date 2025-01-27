import LoginClient from "./login-client";

export const dynamic = "force-static";

const Login = () => {
  return (
    <div className="container relative flex min-h-[calc(100vh-57px)] items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <LoginClient />
      </div>
    </div>
  );
};

export default Login;
