# enumeration.md

**Which field, and why its shape is sensitive**
I chose the OTP (One-Time Password) email code field on the login form. The shape of this field is sensitive because the code functions exactly like a temporary password granting access to the account. 

**What an attacker gains from knowing the shape**
By explicitly stating that the input is a "6-digit code", the interface leaks the exact mathematical boundary of the brute-force attack surface. An attacker instantly knows the keyspace is exactly 1,000,000 numeric combinations. Without this hint, an attacker does not know if the code is 4, 6, or 8 digits, nor whether it contains alphanumeric characters, which exponentially increases the time and computational power required to script an attack.

**The trade-off accepted**
Removing the "6-digit" hint introduces minor friction for legitimate users. They lose the immediate visual reassurance of the exact number of digits to expect. However, because users almost always copy and paste OTPs directly from their email inbox rather than memorizing and typing them manually, this added cognitive friction is negligible. The massive increase in brute-force complexity makes this trade-off completely worth it.