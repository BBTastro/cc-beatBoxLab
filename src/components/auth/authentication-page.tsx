"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AuthenticationPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    creatorType: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle invite form submission here
    console.log("Invite form submitted:", formData);
    // You can add actual invitation logic here
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dieter Herman inspired fade background */}
      <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-[#6D7B56] to-[#5A6B47] rounded-l-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Section - Description */}
            <div className="space-y-8">
              {/* Title and Description */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold">stepBox</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  stepBox helps creators show up daily for one big goal. A grid turns daily work into visible momentum across tabs. Tap a day, log what you did, keep your streak, and{" "}
                  <span className="inline-block animate-pulse bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                    celebrate milestones
                  </span>{" "}
                  on the way to meet your goals!
                </p>
              </div>

            </div>

            {/* Right Section - Invite Form */}
            <div className="flex justify-center lg:justify-end">
              <Card className="w-full max-w-md">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-semibold">Request an Invite</h2>
                      <p className="text-sm text-muted-foreground">
                        Join the waitlist to access stepBox
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Name Field */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="w-full"
                        />
                      </div>

                      {/* Email Field */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="w-full"
                        />
                      </div>

                      {/* Creator Type Field */}
                      <div className="space-y-2">
                        <Label htmlFor="creatorType" className="text-sm font-medium">
                          Creator Type
                        </Label>
                        <Select 
                          value={formData.creatorType} 
                          onValueChange={(value) => setFormData({ ...formData, creatorType: value })}
                          required
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select creator type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="artist">Artist</SelectItem>
                            <SelectItem value="writer">Writer</SelectItem>
                            <SelectItem value="musician">Musician</SelectItem>
                            <SelectItem value="filmmaker">Filmmaker</SelectItem>
                            <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                            <SelectItem value="designer">Designer</SelectItem>
                            <SelectItem value="developer">Developer</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Submit Button */}
                      <Button 
                        type="submit" 
                        className="w-full mt-6"
                        disabled={!formData.name || !formData.email || !formData.creatorType}
                      >
                        Request Invite
                      </Button>
                    </form>

                    {/* Google Sign-in Alternative */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={async () => {
                        try {
                          const { signIn } = await import("@/lib/auth-client");
                          const result = await signIn.social({
                            provider: "google",
                            callbackURL: "/beats",
                          });
                          
                          // Check if sign-in was successful and validate email
                          if (result) {
                            console.log("Sign-in result:", result);
                            // The email validation should happen in the auth callbacks
                            // If we get here, the user should be authenticated
                          }
                        } catch (error) {
                          console.error("Sign-in error:", error);
                          alert("Sign-in failed: " + (error instanceof Error ? error.message : "Unknown error"));
                        }
                      }}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-3"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
