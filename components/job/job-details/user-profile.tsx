// components/user/UserProfile.tsx
"use client";

import React from "react";
import { Card } from "@/components/ui/card";


interface UserProfileProps {
    user: any;
    application?: any;
}

export default function UserProfile({ user}: UserProfileProps) {
    if (!user) return null;

    return (
        <Card className="space-y-4 p-4">
            <div className="flex items-center gap-4">
                <div>
                    <h2 className="text-lg font-semibold">
                        {user.first_name} {user.last_name}
                    </h2>
                    <p className="text-sm text-gray-600">{user.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="font-medium">Location</p>
                    <p>{user.city}, {user.country || "N/A"}</p>
                </div>

                <div>
                    <p className="font-medium">Hourly Rate</p>
                    <p>{user.rate}</p>
                </div>

                <div>
                    <p className="font-medium">Experience</p>
                    <p>{user.experience} years</p>
                </div>

                <div>
                    <p className="font-medium">Gender</p>
                    <p>{user.gender || "N/A"}</p>
                </div>

                <div className="text-xs font-medium">
                    {/* <span className={getStatusClasses(app.status)}>{app.status}</span> */}
                </div>
            </div>

            {user.skills?.length > 0 && (
                <div>
                    <p className="font-medium">Skills</p>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                        {user.skills.map((s: any) => (
                            <li key={s.id}>{s.name}</li>
                        ))}
                    </ul>
                </div>
            )}

            {user.bio && (
                <div>
                    <p className="font-medium">Bio</p>
                    <p className="text-sm text-gray-700">{user.bio}</p>
                </div>
            )}
        </Card>
    );
}
