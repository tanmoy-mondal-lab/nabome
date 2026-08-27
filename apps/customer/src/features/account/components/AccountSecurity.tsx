import {
  Shield,
  Lock,
  Mail,
  Phone,
  Monitor,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';

import { useSessions } from '@nabome/customer';
import type { CustomerSession, LoginHistoryEntry } from '@nabome/customer';
import { Button } from '@nabome/ui';

interface AccountSecurityProps {
  userId: string;
}

export function AccountSecurity({ userId }: AccountSecurityProps) {
  const { sessions, sessionsLoading, sessionsError, revokeSession } =
    useSessions();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);

  const handleRevokeSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to revoke this session?')) {
      await revokeSession(userId, { sessionId });
    }
  };

  const handleRevokeAll = async () => {
    if (
      confirm(
        'Are you sure you want to revoke all sessions? You will be logged out from all devices.',
      )
    ) {
      for (const s of sessions) {
        if (!s.isCurrent) await revokeSession(userId, { sessionId: s.id });
      }
      if (sessions.find((s) => s.isCurrent)) {
        await revokeSession(userId, {
          sessionId: sessions.find((s) => s.isCurrent)!.id,
          revokeAll: true,
        });
      }
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getDeviceIcon = (_deviceType: string) => {
    return <Monitor className="w-4 h-4" />;
  };

  const formatLocation = (
    loc: LoginHistoryEntry['location'] | CustomerSession['location'],
  ) => {
    if (!loc) return 'Unknown location';
    return (
      [loc.city, loc.region, loc.country].filter(Boolean).join(', ') ||
      'Unknown location'
    );
  };

  const loginHistory: LoginHistoryEntry[] = [
    {
      id: '1',
      userId,
      ipAddress: '192.168.1.1',
      userAgent: 'Chrome',
      deviceInfo: {
        type: 'desktop',
        browser: 'Chrome',
        deviceName: 'Chrome on Desktop',
      },
      location: { city: 'Mumbai', region: 'Maharashtra', country: 'IN' },
      success: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId,
      ipAddress: '192.168.1.1',
      userAgent: 'Safari',
      deviceInfo: {
        type: 'mobile',
        browser: 'Safari',
        deviceName: 'Safari on Mobile',
      },
      location: { city: 'Mumbai', region: 'Maharashtra', country: 'IN' },
      success: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  if (sessionsLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg" />
        <div className="h-32 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  if (sessionsError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900">
        {sessionsError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Account Security</h2>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
          Security Settings
        </h3>

        <div className="grid gap-3">
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>

          <Button
            variant="outline"
            className="justify-start"
            onClick={() => setShowEmailForm(!showEmailForm)}
          >
            <Mail className="w-4 h-4 mr-2" />
            Change Email
          </Button>

          <Button
            variant="outline"
            className="justify-start"
            onClick={() => setShowPhoneForm(!showPhoneForm)}
          >
            <Phone className="w-4 h-4 mr-2" />
            Change Phone
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Active Sessions
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRevokeAll}
            className="text-red-600 hover:text-red-700"
          >
            Revoke All
          </Button>
        </div>

        {sessions.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
            No active sessions
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    {getDeviceIcon(session.deviceInfo?.type ?? 'unknown')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {session.deviceInfo?.deviceName ??
                        session.userAgent ??
                        'Unknown device'}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span>{formatLocation(session.location)}</span> •{' '}
                      {formatDate(session.lastActiveAt)}
                    </p>
                  </div>
                  {session.isCurrent && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
          Login History
        </h3>

        <div className="space-y-2">
          {loginHistory.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-4 border rounded-lg"
            >
              <div
                className={`p-2 rounded-full ${entry.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
              >
                {entry.success ? (
                  <Shield className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">
                    {entry.deviceInfo?.browser ?? 'Unknown'} on{' '}
                    {entry.deviceInfo?.type ?? 'unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(entry.createdAt)}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  <span>{formatLocation(entry.location)}</span> •{' '}
                  {entry.ipAddress}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
