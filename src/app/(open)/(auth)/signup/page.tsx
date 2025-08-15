import SignupClient from "./signup-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

export const dynamic = "force-static";

interface SignupPageProps {
  searchParams: { error?: string; message?: string };
}

const Signup = ({ searchParams }: SignupPageProps) => {
  const { error, message } = searchParams;

  return (
    <div className="container relative flex min-h-[calc(100vh-57px)] items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {decodeURIComponent(error)}
            </AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {decodeURIComponent(message)}
            </AlertDescription>
          </Alert>
        )}
        <SignupClient />
      </div>
    </div>
  );
};

export default Signup;
