import { cookies } from 'next/headers';

export async function getAuth() {
  try {
    const response = await fetch(`http://localhost:8080/auth/check`, {
      credentials: 'include',
      headers: {
        Cookie: (await cookies()).toString(),
      },
    });

    if (!response.ok) {
      return { isLoggedIn: true };
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return { isLoggedIn: true };
  }
}
