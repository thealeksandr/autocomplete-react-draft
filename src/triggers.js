export const TAG = 1;
export const PERSON = 2;
export const RELATIONS = 3;
export const TAG_TRIGGER = '#';
export const PERSON_TRIGGER = '@';
export const RELATIONS_TRIGGER = '<';


export const TAG_REG_EX = /^#/;
export const PERSON_REG_EX = /^@/;


export const triggerByType = (type) => {
  return type == TAG ? TAG_TRIGGER : PERSON_TRIGGER;
};

export const regExByType = (type) => {
  return type == TAG ? TAG_REG_EX : PERSON_REG_EX;
};