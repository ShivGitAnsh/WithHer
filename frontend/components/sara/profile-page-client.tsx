'use client';

import { type FormEvent, useState, useTransition } from 'react';
import { Mail, MapPin, ShieldCheck, Trash2, Users } from 'lucide-react';

import { ForHerModeSwitch } from '@/components/sara/forher-mode-provider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  createEmergencyContact,
  deleteEmergencyContact
} from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import type { EmergencyContact, Guardian } from '@/lib/types';

export function ProfilePageClient({
  profile,
  guardians,
  initialEmergencyContacts,
  tripCount,
  activeJourneyCount
}: {
  profile: {
    id: string;
    name: string;
    role: string;
    email: string;
    city: string;
    membership: string;
  };
  guardians: Guardian[];
  initialEmergencyContacts: EmergencyContact[];
  tripCount: number;
  activeJourneyCount: number;
}) {
  const [emergencyContacts, setEmergencyContacts] = useState(initialEmergencyContacts);
  const [contactForm, setContactForm] = useState({
    fullName: '',
    relationship: '',
    phoneNumber: '',
    notes: '',
    isPrimary: false
  });
  const [isCreatingContact, startCreateContact] = useTransition();
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreateContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startCreateContact(async () => {
      try {
        const contact = await createEmergencyContact({
          userId: profile.id,
          fullName: contactForm.fullName.trim(),
          relationship: contactForm.relationship.trim(),
          phoneNumber: contactForm.phoneNumber.trim(),
          notes: contactForm.notes.trim() || undefined,
          isPrimary: contactForm.isPrimary
        });

        setEmergencyContacts((current) => [
          contact,
          ...current.map((item) =>
            contact.isPrimary ? { ...item, isPrimary: false } : item
          )
        ]);
        setContactForm({
          fullName: '',
          relationship: '',
          phoneNumber: '',
          notes: '',
          isPrimary: false
        });
        toast({
          title: 'Emergency contact added',
          description: `${contact.fullName} is now available inside SOS support surfaces.`
        });
      } catch (error) {
        toast({
          title: 'Unable to add emergency contact',
          description: getApiErrorMessage(error, 'Try again in a moment.'),
          variant: 'destructive'
        });
      }
    });
  };

  const handleDeleteContact = (contactId: string) => {
    setDeletingContactId(contactId);

    void deleteEmergencyContact(contactId)
      .then(() => {
        setEmergencyContacts((current) => current.filter((contact) => contact.id !== contactId));
        toast({
          title: 'Emergency contact removed',
          description: 'The contact will no longer appear in SOS support flows.'
        });
      })
      .catch((error) => {
        toast({
          title: 'Unable to remove emergency contact',
          description: getApiErrorMessage(error, 'Try again in a moment.'),
          variant: 'destructive'
        });
      })
      .finally(() => {
        setDeletingContactId(null);
      });
  };

  return (
    <div className="space-y-8 pb-8">
      <section className="rounded-[2rem] border border-border/70 bg-white/92 px-6 py-7 shadow-panel sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-border/70 bg-slate-100">
              <AvatarFallback className="bg-slate-100 text-lg font-semibold text-slate-700">
                {profile.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="eyebrow">Profile</p>
              <h1 className="mt-1 text-3xl font-semibold text-slate-950">{profile.name}</h1>
              <p className="mt-2 text-sm text-slate-600">{profile.role}</p>
            </div>
          </div>
          <Badge variant="secondary" className="self-start md:self-auto">
            {profile.membership}
          </Badge>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel">
            <p className="eyebrow">Contact</p>
            <div className="mt-5 space-y-4">
              <ProfileRow icon={Mail} label="Email" value={profile.email} />
              <ProfileRow icon={MapPin} label="Home base" value={profile.city} />
              <ProfileRow
                icon={ShieldCheck}
                label="Preference"
                value="Safety-first solo travel"
              />
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel">
            <p className="eyebrow">Preferences</p>
            <div className="mt-5">
              <ForHerModeSwitch variant="panel" />
            </div>
          </div>

          <form
            onSubmit={handleCreateContact}
            className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel"
          >
            <p className="eyebrow">Emergency contact setup</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Add people to the SOS bundle
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                value={contactForm.fullName}
                onChange={(value) => setContactForm((current) => ({ ...current, fullName: value }))}
                placeholder="Nikita Shah"
              />
              <Field
                label="Relationship"
                value={contactForm.relationship}
                onChange={(value) =>
                  setContactForm((current) => ({ ...current, relationship: value }))
                }
                placeholder="Friend"
              />
              <Field
                label="Phone number"
                value={contactForm.phoneNumber}
                onChange={(value) =>
                  setContactForm((current) => ({ ...current, phoneNumber: value }))
                }
                placeholder="+91 98..."
              />
              <Field
                label="Notes"
                value={contactForm.notes}
                onChange={(value) => setContactForm((current) => ({ ...current, notes: value }))}
                placeholder="Lives nearby"
              />
            </div>
            <label className="mt-4 flex items-center gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={contactForm.isPrimary}
                onChange={(event) =>
                  setContactForm((current) => ({ ...current, isPrimary: event.target.checked }))
                }
              />
              Mark as primary emergency contact
            </label>
            <div className="mt-5 flex justify-end">
              <Button type="submit" variant="destructive" disabled={isCreatingContact}>
                {isCreatingContact ? 'Adding contact...' : 'Add contact'}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-5">
          <div className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="eyebrow">Guardians</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">Trusted circle</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-4">
              {guardians.map((guardian, index) => (
                <div
                  key={guardian.id}
                  className="rounded-[1.3rem] border border-border/70 bg-slate-50/85 px-4 py-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold text-slate-950">{guardian.fullName}</p>
                    <Badge variant={index === 0 ? 'success' : 'secondary'}>
                      {guardian.relationship}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {guardian.phoneNumber ?? guardian.email ?? 'Contact detail pending'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel">
            <p className="eyebrow">Trip summary</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <ProfileMetric label="Trips saved" value={`${tripCount}`} />
              <ProfileMetric label="Active journeys" value={`${activeJourneyCount}`} />
              <ProfileMetric label="Visible guardians" value={`${guardians.length}`} />
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-border/70 bg-white/92 p-6 shadow-panel">
            <p className="eyebrow">Emergency contacts</p>
            <div className="mt-5 grid gap-4">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="rounded-[1.3rem] border border-border/70 bg-slate-50/85 px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm font-semibold text-slate-950">{contact.fullName}</p>
                        <Badge variant={contact.isPrimary ? 'danger' : 'secondary'}>
                          {contact.relationship}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{contact.phoneNumber}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={deletingContactId === contact.id}
                      onClick={() => handleDeleteContact(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {contact.notes ? (
                    <p className="mt-2 text-sm leading-6 text-slate-500">{contact.notes}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-slate-50/85 px-4 py-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-border/70 bg-slate-50/85 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
      />
    </label>
  );
}
