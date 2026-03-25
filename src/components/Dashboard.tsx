import { useEffect, useMemo, useState } from 'react';
import { Objective, ObjectiveTask, UserProfile } from '../types';
import ProfileCard from './ProfileCard';
import { loadFromLocalStorage, STORAGE_KEYS } from '../utils/localStorage';

interface DashboardProps {
  userProfile: UserProfile;
}

const STATUS_LABELS: Record<Objective['status'], string> = {
  draft: '下書き',
  active: '進行中',
  completed: '完了',
  cancelled: '中止',
};

const PRIORITY_LABELS: Record<Objective['priority'], string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const TASK_STATUS_LABELS: Record<ObjectiveTask['status'], string> = {
  todo: '未着手',
  doing: '今やる',
  done: '完了',
  skipped: '見送り',
};

const statusColorClass: Record<Objective['status'], string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-primary-100 text-primary-700',
  completed: 'bg-success-100 text-success-700',
  cancelled: 'bg-red-100 text-red-700',
};

const priorityColorClass: Record<Objective['priority'], string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-700',
};

const taskStatusColorClass: Record<ObjectiveTask['status'], string> = {
  todo: 'bg-gray-100 text-gray-700',
  doing: 'bg-primary-600 text-white ring-2 ring-primary-200',
  done: 'bg-success-100 text-success-700',
  skipped: 'bg-yellow-100 text-yellow-700',
};

const formatDate = (date?: Date) => {
  if (!date || Number.isNaN(date.getTime())) {
    return '未設定';
  }

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const reviveObjective = (objective: Objective): Objective => ({
  ...objective,
  createdAt: new Date(objective.createdAt),
  updatedAt: new Date(objective.updatedAt),
  period: {
    startDate: new Date(objective.period.startDate),
    endDate: new Date(objective.period.endDate),
  },
  keyResults: objective.keyResults.map((keyResult) => ({
    ...keyResult,
    createdAt: new Date(keyResult.createdAt),
    updatedAt: new Date(keyResult.updatedAt),
  })),
});

const reviveTask = (task: ObjectiveTask): ObjectiveTask => ({
  ...task,
  dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
  createdAt: new Date(task.createdAt),
  updatedAt: new Date(task.updatedAt),
});

const getDeadlineMeta = (date?: Date) => {
  if (!date || Number.isNaN(date.getTime())) {
    return {
      label: '期限未設定',
      className: 'bg-gray-100 text-gray-600 border-gray-200',
      accentClass: 'border-gray-200',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `期限超過 ${Math.abs(diffDays)}日`,
      className: 'bg-red-100 text-red-700 border-red-200',
      accentClass: 'border-red-300 bg-red-50',
    };
  }

  if (diffDays === 0) {
    return {
      label: '今日が期限',
      className: 'bg-orange-100 text-orange-700 border-orange-200',
      accentClass: 'border-orange-300 bg-orange-50',
    };
  }

  if (diffDays <= 3) {
    return {
      label: `あと${diffDays}日`,
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      accentClass: 'border-yellow-300 bg-yellow-50',
    };
  }

  return {
    label: `あと${diffDays}日`,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    accentClass: 'border-gray-200 bg-white',
  };
};

function Dashboard({ userProfile }: DashboardProps) {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [tasks, setTasks] = useState<ObjectiveTask[]>([]);

  useEffect(() => {
    const storedObjectives = loadFromLocalStorage<Objective[]>(STORAGE_KEYS.OBJECTIVES) ?? [];
    const storedTasks = loadFromLocalStorage<ObjectiveTask[]>(STORAGE_KEYS.OBJECTIVE_TASKS) ?? [];

    setObjectives(storedObjectives.map(reviveObjective));
    setTasks(storedTasks.map(reviveTask));
  }, []);

  const taskSummaryByObjective = useMemo(() => {
    return objectives.reduce<Record<string, { total: number; done: number; percent: number }>>((acc, objective) => {
      const objectiveTasks = tasks.filter((task) => task.objectiveId === objective.id);
      const total = objectiveTasks.length;
      const done = objectiveTasks.filter((task) => task.status === 'done').length;
      const percent = total === 0 ? 0 : Math.round((done / total) * 100);

      acc[objective.id] = { total, done, percent };
      return acc;
    }, {});
  }, [objectives, tasks]);

  const summary = useMemo(() => {
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);

    return {
      total: objectives.length,
      active: objectives.filter((objective) => objective.status === 'active').length,
      completed: objectives.filter((objective) => objective.status === 'completed').length,
      upcomingDeadline: objectives.filter((objective) => {
        const endDate = objective.period?.endDate;
        return endDate instanceof Date && !Number.isNaN(endDate.getTime()) && endDate >= now && endDate <= sevenDaysLater;
      }).length,
    };
  }, [objectives]);

  const recentObjectives = useMemo(
    () =>
      [...objectives]
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 5),
    [objectives]
  );

  const nextTasks = useMemo(() => {
    return tasks
      .filter((task) => task.status !== 'done' && task.status !== 'skipped')
      .sort((a, b) => {
        const aIsDoing = a.status === 'doing' ? 0 : 1;
        const bIsDoing = b.status === 'doing' ? 0 : 1;
        if (aIsDoing !== bIsDoing) {
          return aIsDoing - bIsDoing;
        }

        const aHasDueDate = a.dueDate && !Number.isNaN(a.dueDate.getTime());
        const bHasDueDate = b.dueDate && !Number.isNaN(b.dueDate.getTime());

        if (aHasDueDate && bHasDueDate) {
          return a.dueDate!.getTime() - b.dueDate!.getTime();
        }

        if (aHasDueDate) {
          return -1;
        }

        if (bHasDueDate) {
          return 1;
        }

        return a.order - b.order;
      })
      .slice(0, 3);
  }, [tasks]);

  const objectiveTitleById = useMemo(() => {
    return objectives.reduce<Record<string, string>>((acc, objective) => {
      acc[objective.id] = objective.title;
      return acc;
    }, {});
  }, [objectives]);

  return (
    <div className="space-y-6">
      <ProfileCard userProfile={userProfile} />

      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">目標サマリー</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600 mb-1">登録済み目標</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
          </div>
          <div className="rounded-lg bg-primary-50 p-4">
            <p className="text-sm text-primary-700 mb-1">進行中</p>
            <p className="text-2xl font-bold text-primary-700">{summary.active}</p>
          </div>
          <div className="rounded-lg bg-success-50 p-4">
            <p className="text-sm text-success-700 mb-1">完了</p>
            <p className="text-2xl font-bold text-success-700">{summary.completed}</p>
          </div>
          <div className="rounded-lg bg-warning-50 p-4">
            <p className="text-sm text-warning-700 mb-1">7日以内の期限</p>
            <p className="text-2xl font-bold text-warning-700">{summary.upcomingDeadline}</p>
          </div>
        </div>

        {objectives.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-lg">
            <p className="text-lg mb-4">まだ目標が設定されていません</p>
            <p className="text-sm">「新規目標を追加」ボタンから目標を作成してください</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900">最近更新した目標</h4>
              <p className="text-sm text-gray-500">最大5件を表示</p>
            </div>
            <div className="space-y-3">
              {recentObjectives.map((objective) => {
                const taskSummary = taskSummaryByObjective[objective.id] ?? { total: 0, done: 0, percent: 0 };

                return (
                  <div
                    key={objective.id}
                    className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <h5 className="font-semibold text-gray-900">{objective.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{objective.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className={`px-2 py-1 rounded-full ${statusColorClass[objective.status]}`}>
                          {STATUS_LABELS[objective.status]}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${priorityColorClass[objective.priority]}`}>
                          優先度: {PRIORITY_LABELS[objective.priority]}
                        </span>
                        <span className="text-gray-500">期限: {formatDate(objective.period?.endDate)}</span>
                        <span className="text-gray-500">更新: {formatDate(objective.updatedAt)}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">実行タスク進捗</span>
                        <span className="text-gray-600">{taskSummary.done} / {taskSummary.total} 完了 ({taskSummary.percent}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${taskSummary.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="card bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">次にやるタスク</h3>
            <p className="text-sm text-gray-500 mt-1">未完了 task を、着手中 → 期限が近い順で表示</p>
          </div>
          <p className="text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1">最大3件</p>
        </div>

        {nextTasks.length === 0 ? (
          <div className="text-center py-10 text-gray-500 border border-dashed border-gray-200 rounded-lg bg-white">
            <p className="font-medium mb-2">表示できる task がありません</p>
            <p className="text-sm">進行中の大目標に task を追加すると、ここに表示されます。</p>
          </div>
        ) : (
          <div className="space-y-3">
            {nextTasks.map((task, index) => {
              const deadlineMeta = getDeadlineMeta(task.dueDate);
              const objectiveTitle = objectiveTitleById[task.objectiveId] ?? '未設定';

              return (
                <div
                  key={task.id}
                  className={`rounded-xl border p-4 shadow-sm ${deadlineMeta.accentClass} ${
                    task.status === 'doing' ? 'ring-2 ring-primary-200 shadow-md' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-full px-2 py-1">
                          {objectiveTitle}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${taskStatusColorClass[task.status]}`}>
                          {TASK_STATUS_LABELS[task.status]}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-gray-900 leading-snug">{task.title}</h4>

                      {task.description && (
                        <p className="text-sm text-gray-600 mt-2">{task.description}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                      <span className={`text-xs font-semibold border rounded-full px-3 py-1 ${deadlineMeta.className}`}>
                        {deadlineMeta.label}
                      </span>
                      <span className="text-xs text-gray-500">期限: {formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="card hover:shadow-lg transition-shadow text-left">
          <div className="text-primary-600 text-3xl mb-2">📝</div>
          <h4 className="font-bold text-gray-900 mb-1">新規目標を追加</h4>
          <p className="text-sm text-gray-600">新しいMBO目標を設定します</p>
        </button>

        <button className="card hover:shadow-lg transition-shadow text-left">
          <div className="text-success-600 text-3xl mb-2">📊</div>
          <h4 className="font-bold text-gray-900 mb-1">進捗を確認</h4>
          <p className="text-sm text-gray-600">現在の目標達成状況を確認します</p>
        </button>

        <button className="card hover:shadow-lg transition-shadow text-left">
          <div className="text-warning-600 text-3xl mb-2">⭐</div>
          <h4 className="font-bold text-gray-900 mb-1">評価を記録</h4>
          <p className="text-sm text-gray-600">目標の評価を記録します</p>
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
