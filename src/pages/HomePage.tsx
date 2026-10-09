import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout';
import { TestGrid, TestSections } from '../components/quiz';
import { Button, Select } from '../components/ui';
import { useTestsStore } from '../stores/useTestsStore';
import { useQuizStore } from '../stores/useQuizStore';
import { useHistoryStore } from '../stores/useHistoryStore';
import { audioManager } from '../services/audioManager';
import { difficultyLabels, difficultyOrder } from '../utils/difficulty';
import { getTestHistory, getBestPercentage } from '../utils/historyStats';
import {
  collectTags,
  filterTestsByTags,
  groupTestsByCategory,
} from '../utils/testGroups';
import styles from './HomePage.module.css';

export function HomePage() {
  const navigate = useNavigate();
  const {
    tests,
    warning,
    loadTests,
    loading,
    selectedId,
    setSelectedTestId,
  } = useTestsStore();
  const { startTest, resetQuiz } = useQuizStore();
  const activeTest = useQuizStore((s) => s.activeTest);
  const quizStatus = useQuizStore((s) => s.status);
  const currentQuestionIndex = useQuizStore((s) => s.currentQuestionIndex);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const historyEntries = useHistoryStore((s) => s.entries);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const handleOpen = (id: string) => {
    audioManager.play('click');
    setSelectedTestId(id);
    const test = useTestsStore.getState().loadTest(id);
    if (test) {
      startTest(test);
      navigate('/start');
    }
  };

  const categories = Array.from(
    new Set(tests.map((t) => t.category).filter((c): c is string => !!c)),
  );

  const baseFilteredTests = tests.filter((test) => {
    if (categoryFilter !== 'all' && test.category !== categoryFilter)
      return false;
    if (difficultyFilter !== 'all' && test.difficulty !== difficultyFilter)
      return false;
    const query = search.trim().toLowerCase();
    if (query && !test.title.toLowerCase().includes(query)) return false;
    return true;
  });

  const availableTags = collectTags(baseFilteredTests);
  const activeTagFilter = tagFilter.filter((tag) =>
    availableTags.includes(tag),
  );
  const filteredTests = filterTestsByTags(baseFilteredTests, activeTagFilter);
  const groups = groupTestsByCategory(filteredTests);

  const totalAttempts = historyEntries.length;
  const bestOverall =
    historyEntries.length > 0
      ? Math.max(...historyEntries.map((entry) => entry.percentage))
      : null;
  const statsByTest = Object.fromEntries(
    tests.map((test) => {
      const history = getTestHistory(historyEntries, test.id);
      return [
        test.id,
        { best: getBestPercentage(history) ?? 0, attempts: history.length },
      ];
    }),
  );
  const categoryOptions = [
    { value: 'all', label: 'Todas las categorías' },
    ...categories.map((category) => ({ value: category, label: category })),
  ];
  const difficultyPillClass: Record<string, string> = {
    easy: styles.pillEasy,
    medium: styles.pillMedium,
    hard: styles.pillHard,
    mixed: styles.pillMixed,
  };

  return (
    <PageWrapper>
      {activeTest && quizStatus === 'in-progress' && (
        <div className={styles.resumeBanner} role="status">
          <div>
            <strong>Test en curso:</strong> {activeTest.title} — pregunta{' '}
            {currentQuestionIndex + 1} de {activeTest.questions.length}
          </div>
          <div className={styles.resumeActions}>
            <Button onClick={() => navigate('/quiz')}>Reanudar</Button>
            <Button variant="ghost" onClick={() => resetQuiz()}>
              Descartar
            </Button>
          </div>
        </div>
      )}

      <div className={styles.hero}>
        <h1 className={styles.title}>Selecciona un Test</h1>
        <p className={styles.subtitle}>
          Elige un test para poner a prueba tus conocimientos. Tu progreso se
          guarda automáticamente.
        </p>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>{tests.length}</span>
            <span className={styles.heroStatLabel}>tests</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>{totalAttempts}</span>
            <span className={styles.heroStatLabel}>intentos</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>
              {bestOverall !== null ? `${bestOverall}%` : '—'}
            </span>
            <span className={styles.heroStatLabel}>mejor puntuación</span>
          </div>
        </div>
      </div>

      {warning && (
        <div className={styles.warning} role="status">
          {warning}
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <div className={styles.searchWrapper}>
            <svg
              className={styles.searchIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              className={styles.search}
              placeholder="Buscar test por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar test por título"
            />
          </div>
          <Select
            value={categoryFilter}
            options={categoryOptions}
            onChange={setCategoryFilter}
            label="Filtrar por categoría"
            className={styles.selectControl}
          />
          <div
            className={styles.difficultyPills}
            role="group"
            aria-label="Filtrar por dificultad"
          >
            <button
              type="button"
              className={`${styles.pill} ${difficultyFilter === 'all' ? styles.pillActive : ''}`}
              aria-pressed={difficultyFilter === 'all'}
              onClick={() => setDifficultyFilter('all')}
            >
              Todas
            </button>
            {difficultyOrder.map((difficulty) => (
              <button
                key={difficulty}
                type="button"
                className={`${styles.pill} ${difficultyPillClass[difficulty] ?? ''} ${difficultyFilter === difficulty ? styles.pillActive : ''}`}
                aria-pressed={difficultyFilter === difficulty}
                onClick={() => setDifficultyFilter(difficulty)}
              >
                {difficultyLabels[difficulty]}
              </button>
            ))}
          </div>
          <span className={styles.resultCount}>
            {filteredTests.length} de {tests.length} tests
          </span>
        </div>
        {availableTags.length > 0 && (
          <div className={styles.tagChips}>
            {availableTags.map((tag) => {
              const active = activeTagFilter.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={`${styles.tagChip} ${active ? styles.tagChipActive : ''}`}
                  aria-pressed={active}
                  onClick={() =>
                    setTagFilter((current) =>
                      current.includes(tag)
                        ? current.filter((item) => item !== tag)
                        : [...current, tag],
                    )
                  }
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {loading ? (
        <div
          className={styles.skeletonGrid}
          role="status"
          aria-label="Cargando tests"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={styles.skeletonCard} aria-hidden="true">
              <span className={styles.skeletonLineShort} />
              <span className={styles.skeletonLineTitle} />
              <span className={styles.skeletonLineShort} />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <TestGrid
          tests={[]}
          selectedId={selectedId}
          onSelect={handleOpen}
          statsByTest={statsByTest}
        />
      ) : (
        <TestSections
          groups={groups}
          selectedId={selectedId}
          onSelect={handleOpen}
          statsByTest={statsByTest}
        />
      )}

    </PageWrapper>
  );
}
