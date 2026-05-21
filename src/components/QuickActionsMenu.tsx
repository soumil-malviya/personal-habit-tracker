import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  CheckCircle2,
  Flame,
  ListPlus,
  PanelTopOpen,
  Plus,
  Rocket,
  Timer,
  X,
} from 'lucide-react';
import { useTodos } from '../hooks/useTodos';
import { calculateStreak, getLocalDateString } from '../utils';
import { Magnetic } from './motion/Magnetic';
import {
  liquidPanel,
  listItem,
  reducedMotionTransition,
  spring,
} from '../lib/motion/presets';
import type { Habit } from '../types';

interface QuickActionsMenuProps {
  habits: Habit[];
}

export function QuickActionsMenu({ habits }: QuickActionsMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { addTodo } = useTodos();
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const today = getLocalDateString(0);
  const todayDone = useMemo(
    () => habits.filter((habit) => habit.logs.includes(today)).length,
    [habits, today],
  );
  const bestStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map((habit) => calculateStreak(habit.logs).currentStreak));
  }, [habits]);

  useEffect(() => {
    setIsOpen(false);
    setIsAddingTask(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isAddingTask) {
      window.setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isAddingTask]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsAddingTask(false);
        return;
      }

      if (!event.altKey || !event.shiftKey) return;
      const key = event.key.toLowerCase();

      if (key === 'a') {
        event.preventDefault();
        setIsOpen(true);
        setIsAddingTask(true);
      }

      if (key === 'f') {
        event.preventDefault();
        navigate('/app/pomodoro?action=start');
      }

      if (key === 'h') {
        event.preventDefault();
        navigate('/app?view=today');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  const handleAddTask = (event: FormEvent) => {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;
    addTodo(title, '', today);
    setTaskTitle('');
    setIsAddingTask(false);
    setIsOpen(false);
  };

  const openToday = () => {
    navigate('/app?view=today');
    setIsOpen(false);
  };

  const startFocus = () => {
    navigate('/app/pomodoro?action=start');
    setIsOpen(false);
  };

  return (
    <div className="quick-actions pointer-events-none">
      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={prefersReducedMotion ? undefined : liquidPanel}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={reducedMotionTransition(prefersReducedMotion, spring.soft)}
              className="quick-actions-panel glass-panel rounded-2xl p-2.5"
            >
            <div className="flex items-center justify-between gap-3 px-2 pb-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-400">
                  Quick actions
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Alt Shift A/F/H
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/5 light-theme:hover:bg-slate-900/5 transition-all"
                aria-label="Close quick actions"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

              <AnimatePresence mode="wait" initial={false}>
                {isAddingTask ? (
              <motion.form
                key="quick-add-task"
                onSubmit={handleAddTask}
                variants={prefersReducedMotion ? undefined : liquidPanel}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={reducedMotionTransition(prefersReducedMotion, spring.soft)}
                className="quick-add-task rounded-2xl p-2"
              >
                <label className="sr-only" htmlFor="quick-task-title">
                  Quick-add task
                </label>
                <input
                  ref={inputRef}
                  id="quick-task-title"
                  type="text"
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="Add a task for today"
                  className="w-full bg-slate-100/80 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
                <div className="flex items-center gap-2 mt-2">
                  <motion.button
                    type="submit"
                    disabled={!taskTitle.trim()}
                    whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                    className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                  >
                    Add today
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] rounded-xl hover:bg-white/5 light-theme:hover:bg-slate-900/5 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
                ) : (
              <motion.div
                key="quick-action-list"
                className="space-y-1"
                initial={prefersReducedMotion ? undefined : "initial"}
                animate={prefersReducedMotion ? undefined : "animate"}
              >
                <motion.button
                  type="button"
                  onClick={() => setIsAddingTask(true)}
                  custom={0}
                  variants={listItem}
                  whileHover={prefersReducedMotion ? undefined : { x: 2 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                  className="quick-action-row"
                >
                  <span className="quick-action-icon bg-cyan-500/12 text-cyan-600 dark:text-cyan-300">
                    <ListPlus className="w-4 h-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-[var(--text-primary)]">
                      Quick-add task
                    </span>
                    <span className="block text-[11px] text-[var(--text-muted)]">
                      Capture for today
                    </span>
                  </span>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={startFocus}
                  custom={1}
                  variants={listItem}
                  whileHover={prefersReducedMotion ? undefined : { x: 2 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                  className="quick-action-row"
                >
                  <span className="quick-action-icon bg-emerald-500/12 text-emerald-600 dark:text-emerald-300">
                    <Timer className="w-4 h-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-[var(--text-primary)]">
                      Start focus
                    </span>
                    <span className="block text-[11px] text-[var(--text-muted)]">
                      Begin a session
                    </span>
                  </span>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={openToday}
                  custom={2}
                  variants={listItem}
                  whileHover={prefersReducedMotion ? undefined : { x: 2 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                  className="quick-action-row"
                >
                  <span className="quick-action-icon bg-orange-500/12 text-orange-600 dark:text-orange-300">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-[var(--text-primary)]">
                      Today's habits
                    </span>
                    <span className="block text-[11px] text-[var(--text-muted)]">
                      {todayDone}/{habits.length} complete
                    </span>
                  </span>
                </motion.button>

                <motion.div
                  custom={3}
                  variants={listItem}
                  className="quick-actions-streak"
                >
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {bestStreak} day best streak
                  </span>
                </motion.div>
              </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <Magnetic className="quick-actions-fab-wrap" strength={0.16}>
          <motion.button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="quick-actions-fab"
            aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
            aria-expanded={isOpen}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.035 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
            transition={spring.snappy}
          >
            <motion.span
              animate={prefersReducedMotion ? undefined : { rotate: isOpen ? 90 : 0 }}
              transition={spring.snappy}
              className="inline-flex"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </motion.span>
            <span className="hidden sm:inline text-xs font-bold">Actions</span>
            {!isOpen && (
              <span className="quick-actions-fab-glint">
                <Rocket className="w-3 h-3" />
              </span>
            )}
          </motion.button>
        </Magnetic>

        {!isOpen && location.pathname === '/app' && habits.length > 0 && (
          <motion.button
            type="button"
            onClick={openToday}
            className="quick-actions-chip"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            whileHover={prefersReducedMotion ? undefined : { y: -1 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
            transition={spring.soft}
          >
            <PanelTopOpen className="w-3.5 h-3.5" />
            <span>{todayDone}/{habits.length} today</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
