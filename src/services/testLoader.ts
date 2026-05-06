import type { Test, TestMetadata } from '../types';
import { validateTest, validateTestsIndex } from './testValidator';

export async function loadTestsIndex(): Promise<TestMetadata[]> {
  const response = await fetch('/tests/index.json');
  if (!response.ok) throw new Error('Failed to load tests index');
  const data = await response.json();
  const result = validateTestsIndex(data);
  if (!result.success) throw new Error('Invalid tests index format');
  return result.data.tests;
}

export async function loadTest(file: string): Promise<Test> {
  const response = await fetch(`/tests/${file}`);
  if (!response.ok) throw new Error(`Failed to load test: ${file}`);
  const data = await response.json();
  const result = validateTest(data);
  if (!result.success) throw new Error(`Invalid test format: ${result.error.message}`);
  return result.data;
}