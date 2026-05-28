import { PageContainer } from "../../../components/page-container";

export default function GoalsPage() {
  return (
    <PageContainer
      title="目標設定"
      description="体重管理、食事バランス改善、たんぱく質重視などを登録できる想定です。"
    >
      <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-700">1日の目標カロリー</span>
          <input type="number" defaultValue={1600} className="mt-1 w-full rounded-lg border border-slate-200 p-2" />
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">たんぱく質目標 (g)</span>
          <input type="number" defaultValue={90} className="mt-1 w-full rounded-lg border border-slate-200 p-2" />
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">脂質目標 (g)</span>
          <input type="number" defaultValue={50} className="mt-1 w-full rounded-lg border border-slate-200 p-2" />
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">炭水化物目標 (g)</span>
          <input type="number" defaultValue={200} className="mt-1 w-full rounded-lg border border-slate-200 p-2" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm text-slate-700">目標方針</span>
          <select className="mt-1 w-full rounded-lg border border-slate-200 p-2">
            <option>体重管理</option>
            <option>食事バランス改善</option>
            <option>たんぱく質を意識</option>
            <option>脂質を控えめ</option>
            <option>外食・コンビニ中心でも整える</option>
          </select>
        </label>
      </form>
    </PageContainer>
  );
}
