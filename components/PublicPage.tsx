import React from 'react';
import { SubmissionForm } from './SubmissionForm';

interface PublicPageProps {
  ownerUid: string;
}

export const PublicPage: React.FC<PublicPageProps> = ({ ownerUid }) => {
  return (
    <div className="animate-fade-in">
      <SubmissionForm ownerUid={ownerUid} />
      <p className="mt-8 text-center text-sm text-zinc-500">
        Your confession is anonymous and only visible to this account owner.
      </p>
    </div>
  );
};