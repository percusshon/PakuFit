import { PageContainer } from "../../../components/page-container";
import { FeatureCard } from "../../../components/feature-card";

export default function NewMealPage() {
  return (
    <PageContainer title="食事記録を追加" description="AI推定は候補です。ユーザー補正が前提の設計です。">
      <FeatureCard
        title="入力方法"
        description="写真アップロードまたはテキスト入力から開始できます。"
        icon="📸"
      >
        <div className="grid gap-3">
          <button className="rounded-lg border border-dashed border-slate-300 p-3 text-left text-sm text-slate-700">
            写真をアップロード（準備中）
          </button>
          <textarea
            className="min-h-28 rounded-lg border border-slate-200 p-3 text-sm"
            placeholder="例: 鶏むねの照り焼き弁当、半分を食べた"
          />
        </div>
      </FeatureCard>

      <FeatureCard
        title="補正の前提"
        description="料理名・量・食べた割合・調理方法を見直して保存すると、より実態に近い概算になります。"
        icon="✏️"
      >
        <p className="text-sm text-slate-700">
          照明・器具の違いなどで推定値がぶれるため、保存前に内容を確認してください。
        </p>
      </FeatureCard>
    </PageContainer>
  );
}
