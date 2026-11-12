'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './delete-account.module.css';

const DELETE_WARNING =
  'Are you sure? This will immediately log you out and schedule your account for permanent deletion after a 30-day grace period.';

export default function DeleteAccountSection() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
      cancelButtonRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  function openDialog() {
    setError(null);
    setIsOpen(true);
  }

  function closeDialog() {
    if (isDeleting) {
      return;
    }
    setIsOpen(false);
  }

  function handleNativeCancel(event: React.SyntheticEvent<HTMLDialogElement>) {
    if (isDeleting) {
      event.preventDefault();
    }
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  }

  async function handleConfirmDeletion() {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });

      const data = await response.json().catch(() => null);

      if (response.status === 200) {
        setIsOpen(false);
        router.replace('/login');
        return;
      }

      throw new Error(
        typeof data?.error === 'string'
          ? data.error
          : 'We could not delete your account. Please try again.'
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'We could not delete your account. Please try again.'
      );
      setIsDeleting(false);
    }
  }

  return (
    <>
      <section className={styles.dangerZone} aria-labelledby="delete-account-heading">
        <div className={styles.dangerHeader}>
          <h2 id="delete-account-heading" className={`text-title-large ${styles.dangerTitle}`}>
            Danger Zone
          </h2>
          <span className={`text-label-small ${styles.dangerBadge}`}>Account settings</span>
        </div>

        <div className={styles.dangerRow}>
          <div>
            <h3 className={`text-title-medium ${styles.dangerItemTitle}`}>Delete my data</h3>
            <p className={`text-body-medium ${styles.dangerText}`}>
              Request permanent deletion of your account and learner data. You will be signed out
              immediately, and your account will be scheduled for deletion after a 30-day grace
              period.
            </p>
          </div>
          <button
            ref={triggerRef}
            type="button"
            className={`text-label-large ${styles.deleteTrigger}`}
            onClick={openDialog}
          >
            Delete my data
          </button>
        </div>
      </section>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="delete-account-modal-title"
        aria-describedby="delete-account-modal-description"
        onCancel={handleNativeCancel}
        onClose={() => {
          setIsOpen(false);
          triggerRef.current?.focus();
        }}
        onClick={handleBackdropClick}
      >
        <div className={styles.panel}>
          <h2
            id="delete-account-modal-title"
            className={`text-title-large ${styles.modalTitle}`}
          >
            Delete your account?
          </h2>

          <p
            id="delete-account-modal-description"
            className={`text-body-medium ${styles.modalWarning}`}
          >
            {DELETE_WARNING}
          </p>
          <p className={`text-body-small ${styles.modalNote}`}>
            Questions you have already sent to AI providers cannot be removed from provider
            storage.
          </p>

          {error && (
            <div className={styles.errorBanner} role="alert" aria-live="assertive">
              <p className={`text-body-small ${styles.errorText}`}>{error}</p>
            </div>
          )}

          <div className={styles.actions}>
            <button
              ref={cancelButtonRef}
              type="button"
              className={`text-label-large ${styles.cancelButton}`}
              onClick={closeDialog}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`text-label-large ${styles.confirmButton}`}
              onClick={handleConfirmDeletion}
              disabled={isDeleting}
              aria-busy={isDeleting}
            >
              {isDeleting && <span className={styles.spinner} aria-hidden="true" />}
              {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
