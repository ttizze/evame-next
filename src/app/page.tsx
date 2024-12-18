
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { SourceTextAndTranslationSection } from "@/components/SourceTextAndTranslationSection";
import { fetchPageWithTranslations } from "@/app/functions/queries.server";
import { StartButton } from "@/components/StartButton";
import { getLocale } from "@/lib/i18n";

// サーバーアクション宣言: "use server"を付けると、
// この関数はクライアントから<Form>で呼び出せる
export async function startAction(formData: FormData) {
  "use server";
  // ここでフォームデータを処理(action相当)
  // 例: ログインリダイレクトなど
  const value = formData.get("inputName");
  // 何らかの処理後、ページをリフレッシュできる
  // actionsは基本的にSSRと親和性が高く、navigateやredirectなども可能
  return { success: true, value };
}

// RSCでデータ取得(loader相当)
async function getData() {
  const session = await getServerSession();
  const currentUser = session?.user ?? null;

  const locale = await getLocale(cookies());
  const pageName = locale === "en" ? "evame-ja" : "evame";
  const topPageWithTranslations = await fetchPageWithTranslations(
    pageName,
    currentUser?.id ?? 0,
    locale,
  );

  if (!topPageWithTranslations) {
    notFound();
  }

  const heroSet = topPageWithTranslations.sourceTextWithTranslations
    .filter((st) => st.sourceText.number === 0 || st.sourceText.number === 1)
    .sort((a, b) => a.sourceText.number - b.sourceText.number);

  const [heroTitle, heroText] = heroSet;

  if (!heroTitle || !heroText) {
    notFound();
  }

  return { currentUser, heroTitle, heroText };
}

export default async function Page() {
  const { currentUser, heroTitle, heroText } = await getData();

  return (
    <div className="flex flex-col justify-between">
      <main className="prose dark:prose-invert sm:prose lg:prose-lg mx-auto px-2 py-10 flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full">
          <h1 className="text-7xl font-bold mb-20 text-center">
            <SourceTextAndTranslationSection
              sourceTextWithTranslations={heroTitle}
              sourceTextClassName="w-full bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text !text-transparent mb-2"
              elements={heroTitle.sourceText.text}
              currentUserName={currentUser?.userName}
              showOriginal={true}
              showTranslation={true}
            />
          </h1>

          <span className="text-xl mb-12 w-full">
            <SourceTextAndTranslationSection
              sourceTextWithTranslations={heroText}
              sourceTextClassName="mb-2"
              elements={heroText.sourceText.text}
              showOriginal={true}
              showTranslation={true}
              currentUserName={currentUser?.userName}
            />
          </span>

          {!currentUser && (
            <div className="mb-12 flex justify-center mt-10">
              {/* Server Actionを使うフォーム例 */}
              <form action={startAction}>
                {/* 何らかのフォーム入力 */}
                <input type="hidden" name="inputName" value="testValue" />
                {/* フォーム送信でserver actionが呼ばれる */}
                <button type="submit" className="w-60 h-12 text-xl">
                  Start
                </button>
              </form>
              {/* StartButtonをそのまま使いたければ、Server Actionを内部でコールするJSロジックを追加してもいい */}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}