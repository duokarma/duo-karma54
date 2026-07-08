const fs = require('fs');
const fix = (f, replace) => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/import React, \{ useState, useEffect, useRef, useMemo, Suspense \} from 'react';\r?\n/, replace);
  fs.writeFileSync(f, c);
};
fix('src/components/landing/Hero.tsx', "import { useState, useEffect } from 'react';\n");
fix('src/components/landing/Showcase.tsx', "import { useState, useEffect } from 'react';\n");
fix('src/components/landing/Stats.tsx', "import { useState, useEffect, useRef } from 'react';\n");
fix('src/components/landing/ui/Cursor.tsx', "import { useState, useEffect } from 'react';\n");
fix('src/components/landing/WhatWeBuild.tsx', "import { useState } from 'react';\n");
fix('src/pages/landing.tsx', "import { useState, useEffect } from 'react';\n");
