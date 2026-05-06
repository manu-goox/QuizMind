import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout';
import { TestGrid } from '../components/quiz';
import { Button } from '../components/ui';
import { AudioPanel } from '../components/settings/AudioPanel';
import { useTestsStore } from '../stores/useTestsStore';
import { useQuizStore } from '../stores/useQuizStore';
import { audioManager } from '../services/audioManager';
import styles from './HomePage.module.css';

export function HomePage() {
  const navigate = useNavigate();
  const { tests, loading, error, loadTestsIndex, selectedId, setSelectedTestId } = useTestsStore();
  const { startTest } = useQuizStore();

  useEffect(() => {
    loadTestsIndex();
  }, [loadTestsIndex]);

  const handleSelect = (id: string) => {
    audioManager.play('click');
    setSelectedTestId(id);
  };

  const handleStart = async () => {
    if (!selectedId) return;
    audioManager.play('click');
    const test = await useTestsStore.getState().loadTest(selectedId);
    if (test) {
      startTest(test);
      navigate('/start');
    }
  };

  if (loading) return <PageWrapper><div className={styles.message}>Cargando tests...</div></PageWrapper>;
  if (error) return <PageWrapper><div className={styles.error}>{error}</div></PageWrapper>;

  const selectedTest = tests.find((t) => t.id === selectedId);

  return (
    <PageWrapper>
      <AudioPanel />
      <h1 className={styles.title}>Selecciona un Test</h1>
      <TestGrid tests={tests} selectedId={selectedId} onSelect={handleSelect} />
      {selectedTest && (
        <div className={styles.footer}>
          <div className={styles.info}>
            <strong>{selectedTest.title}</strong>
            <span>{selectedTest.questionCount} preguntas</span>
          </div>
          <Button size="large" onClick={handleStart}>Comenzar Test</Button>
        </div>
      )}
    </PageWrapper>
  );
}