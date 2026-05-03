"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/[A-Z]/, "Must contain uppercase").regex(/[0-9]/, "Must contain number"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

interface HouseholdMember {
  id: string;
  role: "OWNER" | "MEMBER";
  user: { id: string; name: string | null; email: string | null };
}

interface HouseholdData {
  id: string;
  name: string;
  members: HouseholdMember[];
}

export function SettingsPage() {
  const [household, setHousehold] = useState<HouseholdData | null>(null);
  const [householdName, setHouseholdName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [renamingHousehold, setRenamingHousehold] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<"OWNER" | "MEMBER">("MEMBER");

  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          profileForm.reset({ name: res.data.name ?? "", email: res.data.email ?? "" });
        }
      })
      .catch(() => toast.error("Failed to load profile"));

    fetch("/api/household")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setHousehold(res.data);
          setHouseholdName(res.data.name);
        }
      })
      .catch(() => toast.error("Failed to load household"));
  }, [profileForm]);

  async function onProfileSubmit(data: ProfileForm) {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json());

    if (res.success) toast.success("Profile updated");
    else toast.error(res.error ?? "Failed to update profile");
  }

  async function onPasswordSubmit(data: PasswordForm) {
    const res = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    }).then((r) => r.json());

    if (res.success) {
      toast.success("Password changed");
      passwordForm.reset();
    } else {
      toast.error(res.error ?? "Failed to change password");
    }
  }

  async function handleRenameHousehold() {
    if (!householdName.trim()) return;
    setRenamingHousehold(true);
    const res = await fetch("/api/household", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: householdName }),
    }).then((r) => r.json());
    setRenamingHousehold(false);
    if (res.success) {
      setHousehold((prev) => prev ? { ...prev, name: res.data.name } : prev);
      toast.success("Household renamed");
    } else {
      toast.error(res.error ?? "Failed to rename household");
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    const res = await fetch("/api/household/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    }).then((r) => r.json());
    setInviting(false);
    if (res.success) {
      setHousehold((prev) =>
        prev ? { ...prev, members: [...prev.members, res.data] } : prev
      );
      setInviteEmail("");
      toast.success("Member added");
    } else {
      toast.error(res.error ?? "Failed to invite member");
    }
  }

  async function handleRemoveMember(userId: string) {
    setRemovingId(userId);
    const res = await fetch(`/api/household/members/${userId}`, { method: "DELETE" }).then((r) => r.json());
    setRemovingId(null);
    if (res.success) {
      setHousehold((prev) =>
        prev ? { ...prev, members: prev.members.filter((m) => m.user.id !== userId) } : prev
      );
      toast.success("Member removed");
    } else {
      toast.error(res.error ?? "Failed to remove member");
    }
  }

  useEffect(() => {
    if (household) {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            const me = household.members.find((m) => m.user.email === res.data.email);
            if (me) setCurrentUserRole(me.role);
          }
        })
        .catch(() => {});
    }
  }, [household]);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your account and household</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your name and email address</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...profileForm.register("name")} />
              {profileForm.formState.errors.name && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...profileForm.register("email")} />
              {profileForm.formState.errors.email && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.email.message}</p>
              )}
            </div>
            <Button type="submit" disabled={profileForm.formState.isSubmitting}>
              {profileForm.formState.isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Change your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword")} />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
              {passwordForm.formState.isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Household */}
      {household && (
        <Card>
          <CardHeader>
            <CardTitle>Household</CardTitle>
            <CardDescription>Manage your household and members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentUserRole === "OWNER" && (
              <div className="space-y-2">
                <Label>Household Name</Label>
                <div className="flex gap-2">
                  <Input
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    placeholder="Household name"
                  />
                  <Button onClick={handleRenameHousehold} disabled={renamingHousehold} variant="outline">
                    {renamingHousehold ? <Loader2 className="size-4 animate-spin" /> : "Rename"}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label>Members ({household.members.length})</Label>
              <div className="space-y-2">
                {household.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs">
                          {(member.user.name ?? member.user.email ?? "?")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.user.name ?? "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.role === "OWNER" ? "default" : "secondary"} className="text-xs">
                        {member.role}
                      </Badge>
                      {currentUserRole === "OWNER" && member.role !== "OWNER" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveMember(member.user.id)}
                          disabled={removingId === member.user.id}
                        >
                          {removingId === member.user.id
                            ? <Loader2 className="size-3.5 animate-spin" />
                            : <Trash2 className="size-3.5" />
                          }
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {currentUserRole === "OWNER" && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Invite Member</Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="member@email.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                    />
                    <Button onClick={handleInvite} disabled={inviting}>
                      {inviting ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">User must already have a MealMap account</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
