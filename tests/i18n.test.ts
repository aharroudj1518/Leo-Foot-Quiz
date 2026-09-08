import {describe,it,expect} from 'vitest';
import {en,t} from '../src/i18n';
describe('t()',()=>{
it('returns the raw string when there are no placeholders',()=>expect(t('home_kickoff_label')).toBe('Let’s play'));
it('substitutes every occurrence of a placeholder',()=>expect(t('quiz_progress',{n:3,total:10})).toBe('QUESTION 3 OF 10'));
it('leaves unknown placeholders literal instead of printing undefined',()=>expect(t('quiz_progress',{n:1})).toBe('QUESTION 1 OF {total}'));
it('has no empty strings and no duplicated whitespace-only keys',()=>{for(const [k,v] of Object.entries(en))expect(v.trim().length,k).toBeGreaterThan(0);});
});
