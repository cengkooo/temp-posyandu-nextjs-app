# ⚠️ CATATAN TENTANG TYPE ERRORS

## TypeScript Errors di `src/lib/api.ts`

Anda mungkin melihat beberapa type errors di file `api.ts` setelah perubahan ini. **Ini NORMAL dan TIDAK akan menyebabkan error saat runtime**.

### Kenapa Terjadi?

Supabase TypeScript client menggunakan types yang di-generate dari database schema. Ketika kita tambah table baru (`patient_extended_data`) atau update enum (`patient_type`), TypeScript belum tahu tentang perubahan ini sampai kita regenerate types.

### Errors yang Muncul:

```typescript
// Error di line 310
.insert(extendedData)
// Error: "Argument of type ... is not assignable to parameter of type 'never'"

// Error di line 106, 340
...patient
// Error: "Spread types may only be created from object types"
```

### Solusi 1: Regenerate Types (RECOMMENDED)

Setelah migration di Supabase berhasil, regenerate types:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project (ganti your-project-ref dengan ref project Anda)
supabase link --project-ref your-project-ref

# Generate types
supabase gen types typescript --linked > src/types/database.types.ts
```

### Solusi 2: Type Assertion (QUICK FIX)

Jika Anda tidak bisa run Supabase CLI, tambahkan type assertion:

```typescript
// Di api.ts, line 310
.insert(extendedData as any)

// Di api.ts, line 340
...(patient as any)
```

Tapi ini **TIDAK DISARANKAN** untuk production.

### Solusi 3: Ignore Temporary (FOR DEVELOPMENT)

Tambahkan `// @ts-expect-error` di atas line yang error:

```typescript
// @ts-expect-error - Will fix after regenerating types from Supabase
.insert(extendedData)
```

## Kesimpulan

**Aplikasi akan tetap jalan normal** karena:
1. Runtime JavaScript tidak peduli dengan TypeScript types
2. Supabase server sudah update dengan schema baru
3. Data yang dikirim sudah sesuai dengan schema database

**Tapi untuk clean codebase**, regenerate types setelah migration selesai.

---

**Status**: ⚠️ Known Issue - Will be resolved after type regeneration  
**Priority**: Low (tidak urgent, tidak block functionality)  
**Impact**: Development experience only (red squiggles di editor)
