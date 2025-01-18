"use client";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { generateCalendarToken, revokeCalendarToken } from "@/actions/calendar";
import { useState } from "react";
import { Copy, RefreshCw, Calendar, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CalendarSettingsProps {
  userId: string;
  initialToken: string | null;
}

export function CalendarSettings({
  userId,
  initialToken,
}: CalendarSettingsProps) {
  const [token, setToken] = useState<string | null>(initialToken);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const calendarUrl = token
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/${userId}/${token}.ics`
    : "";

  const handleGenerateToken = async () => {
    try {
      setIsLoading(true);
      const result = await generateCalendarToken();
      if (result.success && result.token) {
        setToken(result.token);
        toast({
          title: "Success",
          description: "Calendar link generated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate calendar link",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to generate token:", error);
      toast({
        title: "Error",
        description: "Failed to generate calendar link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeToken = async () => {
    try {
      setIsLoading(true);
      const result = await revokeCalendarToken();
      if (result.success) {
        setToken(null);
        toast({
          title: "Success",
          description: "Calendar link revoked successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to revoke calendar link",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to revoke token:", error);
      toast({
        title: "Error",
        description: "Failed to revoke calendar link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (calendarUrl) {
      await navigator.clipboard.writeText(calendarUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Calendar link copied to clipboard",
      });
    }
  };

  return (
    <CardContent className="space-y-4">
      {token ? (
        <>
          <div className="flex gap-2">
            <Input readOnly value={calendarUrl} className="font-mono text-sm" />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="transition-all duration-200"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={() => calendarUrl && window.open(calendarUrl, "_blank")}
              className="w-full"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Open Calendar Feed
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokeToken}
              disabled={isLoading}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Calendar Link
            </Button>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Calendar Sync Information</AlertTitle>
            <AlertDescription className="mt-2">
              <ol className="list-inside list-decimal space-y-1">
                <li>Copy the calendar link above</li>
                <li>Open your calendar app</li>
                <li>Add a new calendar subscription</li>
                <li>Paste the link when prompted</li>
              </ol>
              <p className="mt-2 text-sm">
                Calendar apps typically sync every 24 hours. Changes to your
                work logs will appear in your calendar during the next sync.
              </p>
            </AlertDescription>
          </Alert>
        </>
      ) : (
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Calendar Integration</AlertTitle>
            <AlertDescription>
              Generate a calendar link to sync your work hours with your
              favorite calendar app. Your work logs will appear as events in
              your calendar.
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleGenerateToken}
            disabled={isLoading}
            className="w-full"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Generate Calendar Link
          </Button>
        </div>
      )}
    </CardContent>
  );
}
