-- Promote seed owner
UPDATE "User" SET role = 'ADMIN' WHERE email = 'chef@saf.local';
