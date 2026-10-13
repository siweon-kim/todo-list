# T3 Turbo 학습용 Todo List 가이드

직접 구현하면서 T3 Turbo 구조를 익히기 위한 단계별 가이드입니다.
각 단계는 **배울 것 → 할 일 → 힌트 → 확인** 순서로 구성되어 있습니다.

## 진행 체크리스트

- [ ] Step 0. 전체 구조 파악
- [ ] Step 1. DB를 MySQL로 마저 바꾸기
- [ ] Step 2. Todo 테이블 정의 (`packages/db`)
- [ ] Step 3. tRPC 라우터 만들기 (`packages/api`)
- [ ] Step 4. 목록 화면 (`apps/nextjs`)
- [ ] Step 5. 추가 / 완료 체크 / 삭제
- [ ] Step 6. (심화) 사용자별 Todo
- [ ] Step 7. (심화) 모노레포의 장점 체험하기

---

## Step 0. 전체 그림 먼저 (읽기만)

요청 하나가 흘러가는 경로가 곧 이 프로젝트의 구조입니다.

```
apps/nextjs (화면)
   │  trpc.todo.all.useQuery()
   ▼
packages/api (tRPC 라우터: 비즈니스 로직)
   │  ctx.db.query.Todo.findMany()
   ▼
packages/db (Drizzle 스키마 + DB 클라이언트)
   ▼
MySQL
```

- `apps/*`: 실행되는 앱 / `packages/*`: 앱들이 공유하는 라이브러리 / `tooling/*`: eslint·tsconfig 같은 공통 설정
- 패키지끼리는 `@acme/db`, `@acme/api`처럼 `workspace:*`로 서로 참조합니다 ([pnpm-workspace.yaml](pnpm-workspace.yaml))
- [turbo.json](turbo.json)은 각 패키지의 `dev`/`build`/`lint` 실행 순서와 캐시를 관리합니다

**할 일:** [packages/api/src/router/post.ts](packages/api/src/router/post.ts)와 [apps/nextjs/src/app/\_components/posts.tsx](apps/nextjs/src/app/_components/posts.tsx)를 같이 열어 보세요. `post.all`이 서버에서 어떻게 정의되고 화면에서 어떻게 호출되는지 따라가 보는 게 목표입니다. Todo도 이 구조를 그대로 따라 만들면 됩니다.

---

## Step 1. DB를 MySQL로 마저 바꾸기

**배울 것:** Drizzle의 dialect 개념, 그리고 공유 패키지 하나를 바꾸면 그 패키지를 쓰는 곳(auth 등)도 같이 바뀌어야 한다는 점

아직 Postgres로 남아 있는 곳:

| 파일                                                             | 현재 상태                                         | 바꿀 방향                                                                                                             |
| ---------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [packages/db/src/client.ts](packages/db/src/client.ts)           | `drizzle-orm/vercel-postgres`에 mysql pool을 넘김 | `drizzle-orm/mysql2` 사용 (`mode: "default"` 옵션도 확인)                                                             |
| [packages/db/src/schema.ts](packages/db/src/schema.ts)           | `pgTable`, `t.uuid().defaultRandom()`             | `mysqlTable` 사용. MySQL엔 uuid 타입이 없으므로 `varchar(36)` + `$defaultFn(() => crypto.randomUUID())` 같은 방식으로 |
| [packages/db/src/auth-schema.ts](packages/db/src/auth-schema.ts) | `pgTable`                                         | 직접 고치지 말고 `pnpm auth:generate`로 다시 생성                                                                     |
| [packages/db/src/index.ts](packages/db/src/index.ts)             | `alias` from `pg-core`                            | `mysql-core`로                                                                                                        |
| [packages/auth/src/index.ts](packages/auth/src/index.ts)         | `provider: "pg"`                                  | `"mysql"`                                                                                                             |

**힌트:** MySQL에서 `text` 컬럼은 primary key나 unique로 쓸 수 없습니다. auth-schema를 다시 생성한 결과에서 `id`가 `varchar`로 나오는지 확인해 보세요.

**확인:**

```bash
pnpm db:push      # MySQL에 테이블이 생성되면 성공
pnpm db:studio    # 브라우저에서 테이블이 보이는지 확인
pnpm dev:next     # localhost:3000에서 기존 Post 기능이 동작하는지 확인
```

> 기존 Post 기능이 MySQL에서 그대로 돌아가는 걸 확인하고 넘어가세요. 이게 "정상 기준점"이 됩니다.

---

## Step 2. Todo 테이블 정의 (`packages/db`)

**배울 것:** Drizzle 스키마 작성, `drizzle-zod`로 스키마에서 검증 규칙 자동 생성

**할 일:** [packages/db/src/schema.ts](packages/db/src/schema.ts)에 `Todo` 테이블을 추가하세요.

- 컬럼: `id`, `title`(varchar 256), `completed`(boolean, 기본값 false), `createdAt`, `updatedAt`
- `CreateTodoSchema`를 `createInsertSchema`로 만들고, 클라이언트가 보내면 안 되는 필드는 `.omit()`으로 빼기

**생각해 볼 질문:** `completed`를 생성 스키마에서 빼야 할까요, 남겨야 할까요?

**확인:** `pnpm db:push` → studio에 `todo` 테이블이 보이면 OK

---

## Step 3. tRPC 라우터 만들기 (`packages/api`)

**배울 것:** `query`(조회)와 `mutation`(변경)의 차이, `publicProcedure`와 `protectedProcedure`의 차이, zod로 입력값 검증하기

**할 일:**

1. `packages/api/src/router/todo.ts` 만들기 (`post.ts` 참고)
   - `all`: 전체 조회 (`createdAt` 내림차순)
   - `create`: `CreateTodoSchema`를 input으로
   - `toggle`: `{ id, completed }`를 받아서 update
   - `delete`: id를 받아서 delete
2. [packages/api/src/root.ts](packages/api/src/root.ts)의 `appRouter`에 `todo: todoRouter` 등록

**힌트:** 처음엔 전부 `publicProcedure`로 만드세요. 로그인은 Step 6에서 다룹니다.

**확인:** 등록한 뒤 `apps/nextjs` 아무 파일에서 `trpc.todo.`까지 입력해 보세요. **자동완성이 뜨면 성공**입니다. 서버 코드의 타입이 빌드 과정 없이 프론트엔드로 바로 넘어오는 게 T3 스택의 핵심 장점입니다.

```bash
pnpm typecheck
```

---

## Step 4. 목록 화면 (`apps/nextjs`)

**배울 것:** 서버 컴포넌트의 `prefetch`, `HydrateClient`, 클라이언트 쪽 `useSuspenseQuery`의 관계

**할 일:**

1. `apps/nextjs/src/app/_components/todos.tsx` 만들기 (`"use client"`)
2. `TodoList` 컴포넌트에서 `useSuspenseQuery(trpc.todo.all.queryOptions())`로 목록 표시
3. [apps/nextjs/src/app/page.tsx](apps/nextjs/src/app/page.tsx)에서 `prefetch(trpc.todo.all.queryOptions())` 호출 후 `<Suspense>`로 감싸기

**생각해 볼 질문:** page.tsx에서 `prefetch`를 지우면 어떻게 될까요? 지워 보고 브라우저 Network 탭을 비교해 보세요. 서버에서 미리 가져오는 것과 클라이언트에서 가져오는 것의 차이가 보일 겁니다.

**확인:** studio에서 todo를 직접 하나 넣고 화면에 나타나는지 확인

---

## Step 5. 추가 / 완료 체크 / 삭제

**배울 것:** `useMutation`과 성공 후 캐시 무효화(`invalidateQueries`)

**할 일:**

1. `CreateTodoForm`: 입력창 + 버튼 → `trpc.todo.create.mutationOptions()`
2. 체크박스 → `toggle`, 삭제 버튼 → `delete`
3. 각 mutation의 `onSuccess`에서 `queryClient.invalidateQueries(trpc.todo.pathFilter())`

**힌트:** `posts.tsx`의 `CreatePostForm`과 `PostCard`가 이 패턴 그대로입니다. UI 컴포넌트는 `@acme/ui`에서 가져다 쓰세요 (`Button`, `Input` 등). 필요한 shadcn 컴포넌트가 없으면 `pnpm ui-add`로 추가할 수 있습니다.

**확인:** 새로고침 없이 추가·체크·삭제가 화면에 바로 반영되면 완성 🎉

**도전 과제:** `onMutate`로 **낙관적 업데이트** 구현해 보기 (서버 응답을 기다리지 않고 체크박스가 먼저 바뀌게)

---

## Step 6. (심화) 사용자별 Todo

**배울 것:** better-auth 세션, tRPC context, `protectedProcedure`

1. `Todo`에 `userId` 컬럼 추가 (`user.id`를 참조)
2. 프로시저들을 `protectedProcedure`로 바꾸고 `ctx.session.user.id`로 필터링
3. **보안 포인트:** `toggle`/`delete`에서 `id`만으로 조회하면 다른 사람의 todo도 지울 수 있습니다. 어떻게 막을 수 있을지 생각해 보세요.

> Discord 로그인이 필요합니다. `.env`의 `AUTH_DISCORD_*`를 채우거나, better-auth의 `emailAndPassword`를 켜는 방법도 있습니다.

---

## Step 7. (심화) 모노레포의 장점 체험하기

- **Expo 앱:** `apps/expo`에서 같은 `trpc.todo.*`를 그대로 호출해 보세요. 서버 코드를 하나도 고치지 않고 모바일 앱이 생기는 게 모노레포를 쓰는 이유입니다.
- **validators 패키지:** 프론트·백엔드가 같이 쓰는 검증 규칙(예: 제목 1~100자)을 `@acme/validators`로 옮겨 보기
- **Turbo 캐시:** `pnpm build`를 두 번 실행해서 두 번째에 `FULL TURBO`가 뜨는지 확인
