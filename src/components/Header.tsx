export function Header() {
  return (
    <header className="border-b border-border bg-gradient-to-r from-primary/[0.07] via-primary/[0.02] to-transparent">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
        <img src="/logo.svg" alt="" className="h-8 w-8" aria-hidden="true" />
        <div>
          <h1 className="text-lg font-bold tracking-tight">Deep Extract</h1>
          <p className="text-xs text-muted-foreground">중첩된 압축 파일을 재귀적으로 해제하여 파일만 flat하게 추출합니다.</p>
        </div>
      </div>
    </header>
  );
}
