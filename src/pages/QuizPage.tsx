import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout';
import { QuestionCard, NavigationBar } from '../components/quiz';
import { ProgressBar, Modal, Button, Badge } from '../components/ui';
import { useQuizStore } from '../stores/useQuizStore';
import { useHistoryStore } from '../stores/useHistoryStore';
import { audioManager } from '../services/audioManager';
import { formatTime } from '../utils/formatTime';
import { getRemainingSeconds } from '../utils/timer';
import styles from './QuizPage.module.css';

export function QuizPage() {
  const navigate = useNavigate();
  const {
    activeTest,
    currentQuestionIndex,
    answers,
    skipped,
    setAnswer,
    skipQuestion,
    goToNext,
    goToPrevious,
    goToQuestion,
    startReviewing,
    resumeQuiz,
    finishTest,
    practiceMode,
    startTime,
    status,
  } = useQuizStore();
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [pausedMs, setPausedMs] = useState(0);
  const [pauseStartedAt, setPauseStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const question = activeTest?.questions[currentQuestionIndex] ?? null;
  const scorableQuestions = activeTest
    ? activeTest.questions.filter((q) => q.answers.some((a) => a.correct))
    : [];
  const pausedOffset =
    pausedMs + (pauseStartedAt !== null ? now - pauseStartedAt : 0);
  const remainingSeconds = getRemainingSeconds(
    startTime !== null ? startTime + pausedOffset : null,
    activeTest?.timeLimit,
    now,
  );

  const handleSelectAnswer = useCallback(
    (answerId: string) => {
      if (!question) return;
      setAnswer(question.id, answerId);
      if (practiceMode) {
        const correctAnswer = question.answers.find((a) => a.correct);
        if (!correctAnswer) {
          audioManager.play('click');
        } else {
          audioManager.play(
            correctAnswer.id === answerId ? 'correct' : 'incorrect',
          );
        }
      } else {
        audioManager.play('click');
      }
    },
    [question, setAnswer, practiceMode],
  );

  const handleBack = useCallback(() => {
    if (currentQuestionIndex <= 0) return;
    audioManager.play('click');
    goToPrevious();
  }, [currentQuestionIndex, goToPrevious]);

  const handleNext = useCallback(() => {
    audioManager.play('click');
    goToNext();
  }, [goToNext]);

  const handleSkip = useCallback(() => {
    if (!question) return;
    audioManager.play('skip');
    skipQuestion(question.id);
  }, [question, skipQuestion]);

  const doFinish = useCallback(
    (extraPauseMs = 0) => {
      if (!activeTest) return;
      if (useQuizStore.getState().status === 'finished') return;
      const results = finishTest(pausedMs + extraPauseMs);
      if (!practiceMode) {
        useHistoryStore.getState().addEntry({
          testId: activeTest.id,
          testTitle: activeTest.title,
          correct: results.correct,
          total: results.total,
          percentage: results.percentage,
          passed: results.passed,
          timeSpent: results.timeSpent,
          mode: 'normal',
        });
      }
      audioManager.play(results.passed ? 'win' : 'complete');
    },
    [activeTest, finishTest, practiceMode, pausedMs],
  );

  const handleFinish = useCallback(() => {
    if (!activeTest) return;
    const blanks = activeTest.questions.filter(
      (q) => q.answers.some((a) => a.correct) && !answers[q.id],
    ).length;
    if (blanks > 0) {
      startReviewing();
      setPauseStartedAt(Date.now());
      setShowFinishModal(true);
      return;
    }
    doFinish();
  }, [activeTest, answers, startReviewing, doFinish]);

  useEffect(() => {
    if (!activeTest) {
      navigate('/', { replace: true });
    }
  }, [activeTest, navigate]);

  useEffect(() => {
    if (activeTest && status === 'finished') {
      navigate('/results', { replace: true });
    }
  }, [activeTest, status, navigate]);

  useEffect(() => {
    if (!activeTest || showFinishModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.repeat) return;

      if (
        (event.key === 'Enter' || event.key === ' ') &&
        target?.closest('button, [role="button"]')
      ) {
        return;
      }

      const currentQuestion = activeTest.questions[currentQuestionIndex];
      if (!currentQuestion) return;
      const hasAnswer = Boolean(answers[currentQuestion.id]);
      const isLast = currentQuestionIndex === activeTest.questions.length - 1;

      if (/^[1-9]$/.test(event.key)) {
        if (practiceMode && hasAnswer) return;
        const answer = currentQuestion.answers[Number(event.key) - 1];
        if (answer) {
          event.preventDefault();
          handleSelectAnswer(answer.id);
        }
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          if (currentQuestionIndex > 0) {
            event.preventDefault();
            handleBack();
          }
          break;
        case 'ArrowRight':
          if (hasAnswer && !isLast) {
            event.preventDefault();
            handleNext();
          }
          break;
        case 'Enter':
          event.preventDefault();
          if (isLast) {
            handleFinish();
          } else if (hasAnswer) {
            handleNext();
          }
          break;
        case 's':
        case 'S':
          event.preventDefault();
          if (!hasAnswer) handleSkip();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTest,
    currentQuestionIndex,
    answers,
    showFinishModal,
    practiceMode,
    handleSelectAnswer,
    handleBack,
    handleNext,
    handleFinish,
    handleSkip,
  ]);

  useEffect(() => {
    if (!activeTest?.timeLimit) return;
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, [activeTest?.timeLimit]);

  useEffect(() => {
    if (!activeTest || remainingSeconds === null || remainingSeconds > 0)
      return;
    if (showFinishModal) return;
    if (useQuizStore.getState().status !== 'finished') {
      doFinish();
    }
  }, [activeTest, remainingSeconds, showFinishModal, doFinish]);

  if (!activeTest || !question) return null;

  const totalQuestions = activeTest.questions.length;
  const currentAnswer = answers[question.id];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const answeredScorable = scorableQuestions.filter(
    (q) => answers[q.id],
  ).length;
  const skippedScorable = scorableQuestions.filter((q) =>
    skipped.has(q.id),
  ).length;
  const blankCount = scorableQuestions.length - answeredScorable;
  const endPause = () => {
    if (pauseStartedAt !== null) {
      setPausedMs((prev) => prev + (Date.now() - pauseStartedAt));
      setPauseStartedAt(null);
    }
    setNow(Date.now());
  };

  const closeFinishModal = () => {
    setShowFinishModal(false);
    endPause();
    resumeQuiz();
  };

  const handleReviewBlanks = () => {
    setShowFinishModal(false);
    endPause();
    resumeQuiz();
    const firstBlankIndex = activeTest.questions.findIndex(
      (q) => q.answers.some((a) => a.correct) && !answers[q.id],
    );
    if (firstBlankIndex >= 0) goToQuestion(firstBlankIndex);
  };

  const handleConfirmFinish = () => {
    setShowFinishModal(false);
    const openPauseMs =
      pauseStartedAt !== null ? Date.now() - pauseStartedAt : 0;
    setPauseStartedAt(null);
    doFinish(openPauseMs);
  };

  return (
    <PageWrapper>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.headerInfo}>
            <span className={styles.counter} aria-live="polite">
              Pregunta {currentQuestionIndex + 1} de {totalQuestions}
            </span>
            {practiceMode && <Badge variant="info">Modo práctica</Badge>}
            {remainingSeconds !== null && (
              <span
                className={`${styles.timer} ${remainingSeconds <= 60 ? styles.timerWarning : ''}`}
                aria-label={`Tiempo restante: ${formatTime(remainingSeconds * 1000)}`}
              >
                {formatTime(remainingSeconds * 1000)}
              </span>
            )}
          </div>
          <ProgressBar
            current={answeredScorable}
            total={scorableQuestions.length}
            skipped={skippedScorable}
          />
        </div>

        <QuestionCard
          question={question}
          selectedAnswerId={currentAnswer || null}
          showResult={practiceMode && !!currentAnswer}
          onSelectAnswer={handleSelectAnswer}
        />

        <NavigationBar
          canGoBack={currentQuestionIndex > 0}
          canGoNext={!!currentAnswer || isLastQuestion}
          canSkip={!currentAnswer}
          disableSkip={isLastQuestion}
          isLastQuestion={isLastQuestion}
          skippedCount={skippedScorable}
          onBack={handleBack}
          onSkip={handleSkip}
          onNext={handleNext}
          onFinish={handleFinish}
        />

        <p className={styles.hint}>
          Atajos: 1-{question.answers.length} responder · ← → navegar · Enter
          avanzar/finalizar · S saltar
        </p>

        <Modal
          open={showFinishModal}
          title={
            blankCount === 1
              ? 'Hay 1 pregunta sin responder'
              : `Hay ${blankCount} preguntas sin responder`
          }
          onClose={closeFinishModal}
          actions={
            <>
              <Button variant="primary" onClick={handleReviewBlanks}>
                Revisar pendientes
              </Button>
              <Button variant="ghost" onClick={handleConfirmFinish}>
                Finalizar igualmente
              </Button>
            </>
          }
        >
          <p>
            Si finalizas ahora, esas preguntas contarán como en blanco en el
            resultado.
          </p>
        </Modal>
      </div>
    </PageWrapper>
  );
}
