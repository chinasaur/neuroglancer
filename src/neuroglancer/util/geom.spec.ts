/**
 * @license
 * Copyright 2019 Google Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getFrustrumPlanes, isAABBVisible, mat4, zorderLessThan, decodeMorton3} from 'neuroglancer/util/geom';
import {Uint64} from 'neuroglancer/util/uint64';

describe('decodeMorton3', () => {
  it('works for repetitive pattern', () => {
    expect(decodeMorton3(Uint64.parseString('111000100010001111000100010001111000100010001', 2)))
        .toEqual(Uint32Array.of(0b100011000110001, 0b100101001010010, 0b101001010010100));
  });
});

describe('zorderLessThan', () => {
  it('works for simple examples', () => {
    expect(zorderLessThan(0, 0, 0, 0, 0, 0)).toBe(false);
    expect(zorderLessThan(0, 0, 0, 0, 0, 1)).toBe(true);
    expect(zorderLessThan(0, 0, 0, 0, 1, 0)).toBe(true);
    expect(zorderLessThan(0, 0, 0, 1, 0, 0)).toBe(true);
    expect(zorderLessThan(0, 0, 1, 0, 0, 0)).toBe(false);
    expect(zorderLessThan(0, 1, 0, 0, 0, 0)).toBe(false);
    expect(zorderLessThan(1, 0, 0, 0, 0, 0)).toBe(false);

    expect(zorderLessThan(1, 0, 0, 0, 1, 0)).toBe(true);
    expect(zorderLessThan(0, 1, 0, 0, 0, 1)).toBe(true);
    expect(zorderLessThan(0, 1, 0, 1, 1, 0)).toBe(true);
    expect(zorderLessThan(0, 1, 0, 0, 0, 1)).toBe(true);
    expect(zorderLessThan(1, 1, 0, 2, 0, 0)).toBe(true);
  });
});

describe('getFrustrumPlanes', () => {
  it('works for simple example', () => {
    const m = mat4.perspective(mat4.create(), Math.PI / 2, 4.0, 7, 113);
    const planes = getFrustrumPlanes(new Float32Array(24), m);
    const expectedPlanes = [
      // left
      +0.25, 0, -1, 0,
      // right
      -0.25, 0, -1, 0,
      // bottom
      0, 1, -1, 0,
      // top
      0, -1, -1, 0,
      // near
      0, 0, -1, -7,
      // far
      0, 0, 0.13207542896270752, 14.924528121948242
    ];
    planes.every((x, i) => expect(x).toBeCloseTo(expectedPlanes[i]));
  });
});

describe('isAABBVisible', () => {
  it('works for simple example', () => {
    const m = mat4.perspective(mat4.create(), Math.PI / 2, 4.0, 7, 113);
    const planes = getFrustrumPlanes(new Float32Array(24), m);
    expect(isAABBVisible(-1, -1, -20, 1, 1, -15, planes)).toBe(true);
    expect(isAABBVisible(-50, -1, -8, -40, 1, -7, planes)).toBe(false);
    expect(isAABBVisible(40, -1, -8, 50, 1, -7, planes)).toBe(false);
    expect(isAABBVisible(-1, -50, -8, 1, -40, -7, planes)).toBe(false);
    expect(isAABBVisible(-1, 40, -8, 1, 50, -7, planes)).toBe(false);
    expect(isAABBVisible(-1, -1, -112, 1, 1, -113, planes)).toBe(true);
    expect(isAABBVisible(-1, -1, -114, 1, 1, -118, planes)).toBe(false);
  });
});
