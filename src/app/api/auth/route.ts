import { NextRequest, NextResponse } from "next/server";
import {
  authenticateUserAccount,
  getDefaultOrganization,
  getUserById,
  inviteOrganizationMember,
  listUsers,
  registerUserAccount,
  removeOrganizationMember,
  updateUserProfile,
} from "@/lib/db";

const SESSION_COOKIE_NAME = "difflog_session_uid";

export async function GET(req: NextRequest) {
  const sessionUid = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const [users, organization] = await Promise.all([
    listUsers(),
    getDefaultOrganization(),
  ]);

  let currentUser = sessionUid ? await getUserById(sessionUid) : null;
  if (!currentUser && users.length > 0) {
    currentUser = users[0];
  }

  return NextResponse.json({
    authenticated: Boolean(sessionUid),
    user: currentUser,
    organization,
    members: users,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body ?? {};

    if (action === "login") {
      const { email, password } = body;
      if (!email) {
        return NextResponse.json(
          { error: "Email address is required." },
          { status: 400 }
        );
      }
      const { user, organization } = await authenticateUserAccount({
        email,
        password,
      });

      const res = NextResponse.json({
        status: "authenticated",
        user,
        organization,
      });
      res.cookies.set(SESSION_COOKIE_NAME, user.id, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }

    if (action === "register") {
      const { email, full_name, password, organization_name } = body;
      if (!email || !full_name) {
        return NextResponse.json(
          { error: "Full name and email address are required." },
          { status: 400 }
        );
      }
      const { user, organization } = await registerUserAccount({
        email,
        full_name,
        password,
        organization_name,
      });

      const res = NextResponse.json(
        {
          status: "registered",
          user,
          organization,
        },
        { status: 201 }
      );
      res.cookies.set(SESSION_COOKIE_NAME, user.id, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }

    if (action === "logout") {
      const res = NextResponse.json({ status: "logged_out" });
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }

    if (action === "update_profile") {
      const { userId, full_name, email, role, organization_name } = body;
      if (!userId) {
        return NextResponse.json(
          { error: "userId is required." },
          { status: 400 }
        );
      }
      const updated = await updateUserProfile({
        userId,
        full_name,
        email,
        role,
        organization_name,
      });
      if (!updated) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    if (action === "invite_member") {
      const { email, full_name, role = "member" } = body;
      if (!email || !full_name) {
        return NextResponse.json(
          { error: "Member name and email are required." },
          { status: 400 }
        );
      }
      const member = await inviteOrganizationMember({
        email,
        full_name,
        role,
      });
      const members = await listUsers();
      return NextResponse.json({ member, members }, { status: 201 });
    }

    if (action === "remove_member") {
      const { userId } = body;
      if (!userId) {
        return NextResponse.json(
          { error: "userId is required." },
          { status: 400 }
        );
      }
      const removed = await removeOrganizationMember(userId);
      const members = await listUsers();
      return NextResponse.json({ removed, members });
    }

    return NextResponse.json(
      { error: "Unsupported auth action." },
      { status: 400 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Authentication request failed",
      },
      { status: 400 }
    );
  }
}
