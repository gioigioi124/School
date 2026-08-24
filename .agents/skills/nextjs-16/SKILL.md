---
name: nextjs-16
description: Next.js 16 App Router best practices, Server vs Client Components, Data Fetching, and React Query setup.
---

# Kỹ năng Next.js 16

1. **Luôn dùng App Router**.
2. **Server Components (RSC)** là mặc định. Chỉ thêm `'use client'` ở những file thực sự chứa event listener (onClick), hooks (useState, useEffect) hoặc library cần client-side (framer-motion).
3. Sử dụng Server Actions hoặc `fetch()` API trong RSC.
4. Với các thao tác data-fetching động cần query invalidate ở client, sử dụng **TanStack React Query**.
5. Cấu trúc Layout: Đảm bảo có `error.tsx` và `loading.tsx` ở những route load chậm.
6. Quản lý route: Dùng route groups `(tên_nhóm)` để tách layout mà không ảnh hưởng URL path.
