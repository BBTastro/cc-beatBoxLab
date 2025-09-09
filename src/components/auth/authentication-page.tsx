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
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle invite form submission here
    console.log("Invite form submitted:", formData);
    
    // Show success message
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", creatorType: "" });
    }, 3000);
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
                    {isSubmitted ? (
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-green-600">Invite Requested!</h3>
                          <p className="text-sm text-muted-foreground">
                            Thank you for your interest. We'll be in touch soon!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
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
