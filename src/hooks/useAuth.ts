import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  signInAnonymously,
  signInWithPopup,
  linkWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const provider = new GoogleAuthProvider();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
      } else {
        await signInAnonymously(auth);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    if (!user) return;
    try {
      if (user.isAnonymous) {
        await linkWithPopup(user, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (e: any) {
      if (e.code === 'auth/credential-already-in-use') {
        await signInWithPopup(auth, provider);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, loading, signInWithGoogle, logout };
}
