---
name: Prisma Data Safety
description: Guidelines to prevent data loss when modifying Prisma schema or running database migrations.
---

# Prisma Database Safety Guidelines

**CRITICAL RULE:** Never execute commands that can cause data loss in production or staging environments without EXPLICIT user consent and extreme caution.

## 1. Schema Modifications & Migrations
When making changes to `schema.prisma`:
- **DO NOT** run `npx prisma db push` if there is any risk of losing data (e.g., dropping columns, tables, or altering relations) unless you have confirmed with the user.
- **NEVER** run `npx prisma migrate reset` o `npx prisma db push --accept-data-loss` sin explicarle explícitamente las consecuencias al usuario y recibir un "SÍ" claro.
- **MANDATORY NEON BRANCHING:** Before executing ANY database schema changes (like `db push` or migrations) or bulk data updates that will affect Production, you MUST instruct the user to create a new branch in the Neon Console. Do not proceed with the changes in Production directly. Wait for the user to provide the connection URL of the new branch, test the changes there, and only proceed once verified.
- Cuando actualices modelos, sé extremadamente cuidadoso de no borrar o renombrar accidentalmente modelos o relaciones existentes (como `CardDetail`). 

## 2. Bulk Updates & Scripts
When writing scripts to update data:
- Always test the script on a single record or small batch first.
- Ensure the script only updates the intended fields and does not overwrite or drop relations accidentally.
- Nunca uses comandos destructivos en la DB sin preguntar.

## 3. Investigando Bugs
- If relations or tables appear empty abruptly, consider if a previous agent ran a destructive database command. Notify the user to restore a backup if needed.
