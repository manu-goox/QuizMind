import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout';
import { QuestionCard, NavigationBar } from '../components/quiz';
import { ProgressBar } from '../components/ui';
import { AudioPanel } from '../components/settings/AudioPanel';
import { useQuizStore } from '../stores/useQuizStore';
import { audioManager } from '../services/audioManager';
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
    finishTest,
  } = useQuizStore();

  useEffect(() => {
    if (!activeTest) {
      navigate('/');
    }
  }, [activeTest, navigate]);

  if (!activeTest) return null;

  const question = activeTest.questions[currentQuestionIndex];
  const totalQuestions = activeTest.questions.length;
  const currentAnswer = answers[question.id];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const skippedCount = skipped.size;

  const handleSelectAnswer = (answerId: string) => {
    setAnswer(question.id, answerId);
    audioManager.play('click');
  };

  const handleBack = () => {
    audioManager.play('click');
    goToPrevious();
  };

  const handleNext = () => {
    audioManager.play('click');
    goToNext();
  };

  const handleSkip = () => {
    audioManager.play('skip');
    skipQuestion(question.id);
  };

  const handleFinish = () => {
    const results = finishTest();
    audioManager.play(results.passed ? 'win' : 'complete');
    navigate('/results');
  };

  return (
    <PageWrapper>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.counter}>
            Pregunta {currentQuestionIndex + 1} de {totalQuestions}
          </span>
          <ProgressBar current={Object.keys(answers).length} total={totalQuestions} skipped={skippedCount} />
        </div>

        <AudioPanel />

        <QuestionCard
          question={question}
          selectedAnswerId={currentAnswer || null}
          showResult={false}
          onSelectAnswer={handleSelectAnswer}
        />

        <NavigationBar
          canGoBack={currentQuestionIndex > 0}
          canGoNext={!!currentAnswer || isLastQuestion}
          isLastQuestion={isLastQuestion}
          skippedCount={skippedCount}
          onBack={handleBack}
          onSkip={handleSkip}
          onNext={handleNext}
          onFinish={handleFinish}
        />
      </div>
    </PageWrapper>
  );
}