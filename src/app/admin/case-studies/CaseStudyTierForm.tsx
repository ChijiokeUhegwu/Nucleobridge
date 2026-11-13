'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin-case-studies.module.css';

type AccessMode = 'FREE' | 'PAID' | 'SPLIT';
type Tier = 'FREE' | 'PAID';

type CaseStudyTierFormProps = {
  caseStudyId: string;
  caseStudyTitle: string;
  accessMode: AccessMode;
};

export default function CaseStudyTierForm({
  caseStudyId,
  caseStudyTitle,
  accessMode,
}: CaseStudyTierFormProps) {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<Tier | ''>(() => {
    if (accessMode === 'FREE' || accessMode === 'PAID') {
      return accessMode;
    }

    return '';
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTier || selectedTier === accessMode) {
      return;
    }

    setPending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/case-studies/update-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseStudyId, tier: selectedTier }),
      });

      const data: { error?: string } | null = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Could not update the case study tier.');
      }

      setSuccess(`Updated to ${selectedTier === 'PAID' ? 'Premium' : 'Free'}.`);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not update the case study tier.'
      );
    } finally {
      setPending(false);
    }
  }

  const selectId = `tier-${caseStudyId}`;
  const noChange = selectedTier === '' || selectedTier === accessMode;

  return (
    <form className={styles.tierForm} onSubmit={handleSubmit}>
      <label className={styles.srOnly} htmlFor={selectId}>
        Access tier for {caseStudyTitle}
      </label>
      <select
        id={selectId}
        className={styles.tierSelect}
        value={selectedTier}
        onChange={(event) => {
          setSelectedTier(event.target.value as Tier | '');
          setError(null);
          setSuccess(null);
        }}
        disabled={pending}
      >
        {accessMode === 'SPLIT' && (
          <option value="" disabled>
            Choose a tier
          </option>
        )}
        <option value="FREE">Free</option>
        <option value="PAID">Premium</option>
      </select>
      <button
        type="submit"
        className={styles.updateButton}
        disabled={pending || noChange}
        aria-label={`Update tier for ${caseStudyTitle}`}
      >
        {pending ? 'Updating...' : 'Update tier'}
      </button>

      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className={styles.formSuccess} role="status">
          {success}
        </p>
      )}
    </form>
  );
}
