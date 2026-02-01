
import { Lesson, Finger } from './types';

export const KEYBOARD_LAYOUT = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Alt', 'Space', 'Alt', 'Ctrl']
];

export const FINGER_MAP: Record<string, Finger> = {
  'q': 'left-pinky', 'a': 'left-pinky', 'z': 'left-pinky', '1': 'left-pinky', '`': 'left-pinky',
  'w': 'left-ring', 's': 'left-ring', 'x': 'left-ring', '2': 'left-ring',
  'e': 'left-middle', 'd': 'left-middle', 'c': 'left-middle', '3': 'left-middle',
  'r': 'left-index', 'f': 'left-index', 'v': 'left-index', '4': 'left-index',
  't': 'left-index', 'g': 'left-index', 'b': 'left-index', '5': 'left-index',
  ' ': 'thumb',
  'y': 'right-index', 'h': 'right-index', 'n': 'right-index', '6': 'right-index',
  'u': 'right-index', 'j': 'right-index', 'm': 'right-index', '7': 'right-index',
  'i': 'right-middle', 'k': 'right-middle', ',': 'right-middle', '8': 'right-middle',
  'o': 'right-ring', 'l': 'right-ring', '.': 'right-ring', '9': 'right-ring',
  'p': 'right-pinky', ';': 'right-pinky', '/': 'right-pinky', '0': 'right-pinky',
  "'": 'right-pinky', '[': 'right-pinky', ']': 'right-pinky', '-': 'right-pinky',
  '=': 'right-pinky', '\\': 'right-pinky', 'Enter': 'right-pinky', 'Backspace': 'right-pinky'
};

export const MOTIVATION_QUOTES = [
  "Precision is the mother of speed.",
  "Your fingers are learning to dance.",
  "Trust the process. Speed is a byproduct.",
  "Every mistake is a lesson in disguise.",
  "Consistency is the secret of masters.",
  "Don't look down; the screen is your guide.",
  "Slow is smooth, and smooth is fast.",
  "Focus on accuracy; speed will find you.",
  "You are building a superpower, one key at a time.",
  "The keyboard is your instrument. Play it well."
];

export const INITIAL_LESSONS: Lesson[] = [
  // PART 1: HOME ROW INTRO (1-10)
  { id: '1', order: 1, title: 'F and J', description: 'Index fingers on the bumps.', content: 'f j f j ff jj f f j j fj fj', difficulty: 'Beginner', category: 'Basics', newKeys: ['f', 'j'] },
  { id: '2', order: 2, title: 'D and K', description: 'Middle fingers join in.', content: 'd k d k dd kk d k dk dk f j d k', difficulty: 'Beginner', category: 'Basics', newKeys: ['d', 'k'] },
  { id: '3', order: 3, title: 'S and L', description: 'Ring finger reaches.', content: 's l s l ss ll s l sl sl d k s l f j', difficulty: 'Beginner', category: 'Basics', newKeys: ['s', 'l'] },
  { id: '4', order: 4, title: 'A and ;', description: 'The pinky stretch.', content: 'a ; a ; aa ;; a ; a; a; d k s l f j', difficulty: 'Beginner', category: 'Basics', newKeys: ['a', ';'] },
  { id: '5', order: 5, title: 'Home Row Review', description: 'All 8 home row keys.', content: 'asdf jkl; asdf jkl; aj sk dl f; asdf jkl;', difficulty: 'Beginner', category: 'Basics' },
  { id: '6', order: 6, title: 'Letter G', description: 'Left index stretch right.', content: 'g g g fg fg gf gf gag dad fad glad', difficulty: 'Beginner', category: 'Basics', newKeys: ['g'] },
  { id: '7', order: 7, title: 'Letter H', description: 'Right index stretch left.', content: 'h h h jh jh hj hj hash hall had half', difficulty: 'Beginner', category: 'Basics', newKeys: ['h'] },
  { id: '8', order: 8, title: 'G and H Duo', description: 'Mastering the inner reaches.', content: 'gh gh hg hg glass flash dash shall slash', difficulty: 'Beginner', category: 'Basics' },
  { id: '9', order: 9, title: 'Home Row Words 1', description: 'Common words on the home row.', content: 'dad had sad lad glass flash salad fall', difficulty: 'Beginner', category: 'Basics' },
  { id: '10', order: 10, title: 'Home Row Master', description: 'Mastery check for home row.', content: 'the lad had a salad in a glass flask.', difficulty: 'Beginner', category: 'Basics' },

  // PART 2: TOP ROW REACHES (11-20)
  { id: '11', order: 11, title: 'Letter E', description: 'Left middle finger up.', content: 'e e e de de ed ed feel deed fed seed', difficulty: 'Beginner', category: 'Basics', newKeys: ['e'] },
  { id: '12', order: 12, title: 'Letter I', description: 'Right middle finger up.', content: 'i i i ki ki ik ik lid silk kid fills', difficulty: 'Beginner', category: 'Basics', newKeys: ['i'] },
  { id: '13', order: 13, title: 'E and I Practice', description: 'Vowel reaches.', content: 'ei ei ie ie file side life tide ride', difficulty: 'Beginner', category: 'Basics' },
  { id: '14', order: 14, title: 'Letter R', description: 'Left index finger up.', content: 'r r r fr fr rf rf red rider dark fire', difficulty: 'Beginner', category: 'Basics', newKeys: ['r'] },
  { id: '15', order: 15, title: 'Letter U', description: 'Right index finger up.', content: 'u u u ju ju uj uj mud sun run full dusk', difficulty: 'Beginner', category: 'Basics', newKeys: ['u'] },
  { id: '16', order: 16, title: 'R and U Flow', description: 'Top row index power.', content: 'ru ru ur ur rude user sure true rule', difficulty: 'Beginner', category: 'Basics' },
  { id: '17', order: 17, title: 'Letter T', description: 'Left index up-right.', content: 't t t ft ft tf tf tell talk tall test', difficulty: 'Beginner', category: 'Basics', newKeys: ['t'] },
  { id: '18', order: 18, title: 'Letter Y', description: 'Right index up-left.', content: 'y y y jy jy yj yj yet year you toy sky', difficulty: 'Beginner', category: 'Basics', newKeys: ['y'] },
  { id: '19', order: 19, title: 'T and Y Review', description: 'Center top reaches.', content: 'ty ty yt yt tray they type city duty', difficulty: 'Beginner', category: 'Basics' },
  { id: '20', order: 20, title: 'Top Row Master 1', description: 'First half of top row.', content: 'the user will try to ride the red tide.', difficulty: 'Intermediate', category: 'Basics' },

  // PART 3: TOP ROW REMAINING (21-30)
  { id: '21', order: 21, title: 'Letter W', description: 'Left ring finger up.', content: 'w w w sw sw ws ws will wood wall wide', difficulty: 'Beginner', category: 'Basics', newKeys: ['w'] },
  { id: '22', order: 22, title: 'Letter O', description: 'Right ring finger up.', content: 'o o o lo lo ol ol look book cook door', difficulty: 'Beginner', category: 'Basics', newKeys: ['o'] },
  { id: '23', order: 23, title: 'W and O Combo', description: 'Ring finger coordination.', content: 'wo wo ow ow wool wood wolf word work', difficulty: 'Beginner', category: 'Basics' },
  { id: '24', order: 24, title: 'Letter Q', description: 'Left pinky finger up.', content: 'q q q aq aq qa qa quit quiet queen quick', difficulty: 'Beginner', category: 'Basics', newKeys: ['q'] },
  { id: '25', order: 25, title: 'Letter P', description: 'Right pinky finger up.', content: 'p p p ;p ;p p; p; page pool play part', difficulty: 'Beginner', category: 'Basics', newKeys: ['p'] },
  { id: '26', order: 26, title: 'Q and P Drill', description: 'Pinky power.', content: 'qp qp pq pq pipe equip paper speed', difficulty: 'Beginner', category: 'Basics' },
  { id: '27', order: 27, title: 'Top Row Review', description: 'Full top row check.', content: 'we were quiet while playing the pipe.', difficulty: 'Intermediate', category: 'Basics' },
  { id: '28', order: 28, title: 'Words: Quick & Power', description: 'Mixed row word practice.', content: 'quick power world your people property', difficulty: 'Intermediate', category: 'Speed' },
  { id: '29', order: 29, title: 'Common Words 1', description: 'High frequency words.', content: 'the and for are but not you all any', difficulty: 'Intermediate', category: 'Speed' },
  { id: '30', order: 30, title: 'Mastery check', description: 'Full top and home mix.', content: 'the power of people will lead the way.', difficulty: 'Intermediate', category: 'Basics' },

  // PART 4: BOTTOM ROW INTRO (31-40)
  { id: '31', order: 31, title: 'Letter V', description: 'Left index down.', content: 'v v v fv fv vf vf view vive velvet valve', difficulty: 'Beginner', category: 'Basics', newKeys: ['v'] },
  { id: '32', order: 32, title: 'Letter N', description: 'Right index down.', content: 'n n n jn jn nj nj sun rain nine noon', difficulty: 'Beginner', category: 'Basics', newKeys: ['n'] },
  { id: '33', order: 33, title: 'V and N Practice', description: 'Lower index reaches.', content: 'vn vn nv nv even never van navy nerve', difficulty: 'Beginner', category: 'Basics' },
  { id: '34', order: 34, title: 'Letter C', description: 'Left middle down.', content: 'c c c dc dc cd cd cake city cold race', difficulty: 'Beginner', category: 'Basics', newKeys: ['c'] },
  { id: '35', order: 35, title: 'Letter M', description: 'Right middle down.', content: 'm m m jm jm mj mj moon milk home swim', difficulty: 'Beginner', category: 'Basics', newKeys: ['m'] },
  { id: '36', order: 36, title: 'C and M Flow', description: 'Lower middle coordination.', content: 'cm cm mc mc come camp mica calm scam', difficulty: 'Beginner', category: 'Basics' },
  { id: '37', order: 37, title: 'Letter X', description: 'Left ring down.', content: 'x x x sx sx xs xs box six fox next taxi', difficulty: 'Beginner', category: 'Basics', newKeys: ['x'] },
  { id: '38', order: 38, title: 'Comma Key', description: 'Right ring down.', content: ', , , l, l, ,l ,l milk, eggs, bread, cake', difficulty: 'Beginner', category: 'Basics', newKeys: [','] },
  { id: '39', order: 39, title: 'X and Comma', description: 'Lower ring reaches.', content: 'next, tax, fix, mix, lax, box,', difficulty: 'Beginner', category: 'Basics' },
  { id: '40', order: 40, title: 'Mastery check', description: 'Bottom row first half.', content: 'never come back, even if you can win.', difficulty: 'Intermediate', category: 'Basics' },

  // PART 5: BOTTOM ROW REMAINING (41-50)
  { id: '41', order: 41, title: 'Letter Z', description: 'Left pinky down.', content: 'z z z az az za za zero zone maze size', difficulty: 'Beginner', category: 'Basics', newKeys: ['z'] },
  { id: '42', order: 42, title: 'Period Key', description: 'Right pinky down.', content: '. . . ;. ;. .; .; end. stop. wait. look.', difficulty: 'Beginner', category: 'Basics', newKeys: ['.'] },
  { id: '43', order: 43, title: 'Z and Period', description: 'Lower pinky reaches.', content: 'z. z. .z .z buzz. fizz. jazz. daze.', difficulty: 'Beginner', category: 'Basics' },
  { id: '44', order: 44, title: 'Letter B', description: 'Left index stretch down-right.', content: 'b b b fb fb bf bf bird blue ball book', difficulty: 'Beginner', category: 'Basics', newKeys: ['b'] },
  { id: '45', order: 45, title: 'Slash and Mark', description: 'Right pinky down.', content: '/ / / ;/ ;/ /; /; and/or/not yes/no up/down', difficulty: 'Beginner', category: 'Basics', newKeys: ['/'] },
  { id: '46', order: 46, title: 'Bottom Row Review', description: 'Full bottom row check.', content: 'the lazy brown fox jumped over zero.', difficulty: 'Intermediate', category: 'Basics' },
  { id: '47', order: 47, title: 'Tricky Words: Double', description: 'Double letter practice.', content: 'letter bottle appeal school across', difficulty: 'Intermediate', category: 'Speed' },
  { id: '48', order: 48, title: 'Tricky Words: Silent', description: 'Silent letter practice.', content: 'knight honest muscle island wrote', difficulty: 'Intermediate', category: 'Speed' },
  { id: '49', order: 49, title: 'The Full Alpha', description: 'Sentences using all letters.', content: 'the quick brown fox jumps over the lazy dog.', difficulty: 'Advanced', category: 'Basics' },
  { id: '50', order: 50, title: 'Row Master Check', description: 'Final alpha review.', content: 'vibrant zebra boxes might contain quiet onyx.', difficulty: 'Advanced', category: 'Basics' },

  // PART 6: SHIFT & ADVANCED (51-65)
  { id: '51', order: 51, title: 'Left Shift', description: 'Shift with left pinky.', content: 'K L J H I U O P Y N M', difficulty: 'Intermediate', category: 'Basics' },
  { id: '52', order: 52, title: 'Right Shift', description: 'Shift with right pinky.', content: 'A S D F G Q W E R T Z X C V B', difficulty: 'Intermediate', category: 'Basics' },
  { id: '53', order: 53, title: 'Proper Names', description: 'Capitalization practice.', content: 'Alice Bob Charlie David Eve Frank Grace', difficulty: 'Intermediate', category: 'Stories' },
  { id: '54', order: 54, title: 'Sentence Start', description: 'Full sentence flow.', content: 'The journey of a thousand miles starts now.', difficulty: 'Intermediate', category: 'Stories' },
  { id: '55', order: 55, title: 'Numbers: 1 to 5', description: 'Left hand numbers.', content: '1 2 3 4 5 11 22 33 44 55', difficulty: 'Intermediate', category: 'Basics', newKeys: ['1', '2', '3', '4', '5'] },
  { id: '56', order: 56, title: 'Numbers: 6 to 0', description: 'Right hand numbers.', content: '6 7 8 9 0 66 77 88 99 00', difficulty: 'Intermediate', category: 'Basics', newKeys: ['6', '7', '8', '9', '0'] },
  { id: '57', order: 57, title: 'Number Dash', description: 'Mixed number flow.', content: '10 25 67 89 43 100 250 999', difficulty: 'Advanced', category: 'Speed' },
  { id: '58', order: 58, title: 'Data Entry 1', description: 'Numbers and letters.', content: 'Model 402, Unit 99, Area 51, Room 10.', difficulty: 'Advanced', category: 'Speed' },
  { id: '59', order: 59, title: 'Tricky Pairs', description: 'Commonly confused keys.', content: 'bp pb dq qd mw wm mn nm un nu', difficulty: 'Advanced', category: 'Speed' },
  { id: '60', order: 60, title: 'Symbol Power: Bang', description: 'Shifted numbers 1-5.', content: '! @ # $ % !@ #$ %^', difficulty: 'Advanced', category: 'Basics', newKeys: ['!', '@', '#', '$', '%'] },
  { id: '61', order: 61, title: 'Symbol Power: Ops', description: 'Math and operations.', content: '2+2=4 10*10=100 50/2=25', difficulty: 'Advanced', category: 'Basics' },
  { id: '62', order: 62, title: 'Code Intro 1', description: 'Programming-like patterns.', content: 'const hero = { speed: 100, rank: 1 };', difficulty: 'Advanced', category: 'Stories' },
  { id: '63', order: 63, title: 'Endurance Drill 1', description: 'Sustained typing.', content: 'Success is not given, it is earned. You have worked hard to reach this level of mastery.', difficulty: 'Advanced', category: 'Stories' },
  { id: '64', order: 64, title: 'Hero Quote Finale', description: 'Grand inspirational finish.', content: 'The only person you should try to be better than is the person you were yesterday.', difficulty: 'Advanced', category: 'Stories' },
  { id: '65', order: 65, title: 'Grand Graduation', description: 'The final mission.', content: 'Congratulations Hero! You have unlocked your full potential and mastered the keyboard with 100% precision.', difficulty: 'Advanced', category: 'Stories' }
];
