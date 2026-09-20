import React from 'react';
import SignInButton from '../../../components/SignInButton';
import styles from './SignInPage.module.css';

export default function SignInPage() {
  return (
    <main className={styles.container}>
      <div className={styles.glassCard}>
        <h1 className={styles.title}>Welcome to DisplayCellPros</h1>
        <p className={styles.subtitle}>Secure technician portal – sign in with Vercel</p>
        <SignInButton />
      </div>
    </main>
  );
}
