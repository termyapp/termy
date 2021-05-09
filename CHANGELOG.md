# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.0.1](https://github.com/termyapp/Termy/compare/v0.3.0...v0.0.1) (2021-05-09)


### Bug Fixes

* this api only accepts integers bug ([d146b3f](https://github.com/termyapp/Termy/commit/d146b3f010f0e7db1d8d5e1aa2db8cde545ea834))
* **cd:** use command as args for path ([937b306](https://github.com/termyapp/Termy/commit/937b30630f923f61cbaab3dc90ab30ce63f17afe))
* call api sync for pretty path & branch ([b8012b3](https://github.com/termyapp/Termy/commit/b8012b30ccca781f065a5364d2ed986fe05901b5))
* import Duration ([e121161](https://github.com/termyapp/Termy/commit/e121161d636b12c6deccbabdcd62b248077cf16d))
* IT KINDA WORKS FINALLY ([9d2dbf8](https://github.com/termyapp/Termy/commit/9d2dbf8170c2c80d7ced5863c9584c785f4a99ca))
* make alias (~) work by passing tokenized args ([e7fde1d](https://github.com/termyapp/Termy/commit/e7fde1d83785bab3f7bc9dd276a637b09d738116))
* only mutate the suggestions starting with `.` ([e0ab817](https://github.com/termyapp/Termy/commit/e0ab817581a238ed3de0f7620db5a1caa68ac102))
* record history again ([e75aed5](https://github.com/termyapp/Termy/commit/e75aed54faee67318d5eb3edcd16a70ae289bdd1))
* remove 'on' & update branch styles ([fdec1e1](https://github.com/termyapp/Termy/commit/fdec1e181a3aa5dfec5abfc86d1cf6b8a0893219))
* **electron:** set icon on linux ([ea30742](https://github.com/termyapp/Termy/commit/ea307426e3f65c4dfdb2fea8df71a6378cad11f4)), closes [#91](https://github.com/termyapp/Termy/issues/91)
* **gui:** wrap markdown type in component ([585e7f5](https://github.com/termyapp/Termy/commit/585e7f5a577c339d5e41508fb441d35b3e9f1a5a))
* **logger:** raise prod log level to info ([1f29bd3](https://github.com/termyapp/Termy/commit/1f29bd3467c1451745c409f9ae823ecf16aa9a59))
* **prompt:** update branch & pretty-path on focus change ([f34ab7a](https://github.com/termyapp/Termy/commit/f34ab7a4533d1108b6411c21d9a96cfb284cf70c))
* **shell:** implicit cd/view not working ([680dfab](https://github.com/termyapp/Termy/commit/680dfabf9041a2fabc70a856afb600879f9dec41))
* add correct error contexts during parsing ([669de23](https://github.com/termyapp/Termy/commit/669de23e0b8aa8d909db89b642fb3051aeef61ba))
* correct prod tldr path ([7b305cf](https://github.com/termyapp/Termy/commit/7b305cfd1d9e4b12a37c223e4ed22f6f825ffb2f))
* create history file if it doesn't exist' ([ce14065](https://github.com/termyapp/Termy/commit/ce14065838ac149024cce0c0f9651d50115b9c76))
* create history if not found ([47f4a13](https://github.com/termyapp/Termy/commit/47f4a133b8c896b2d30ac41b3a8a038452080ada))
* don't suggest paths in history ([6a6f6ac](https://github.com/termyapp/Termy/commit/6a6f6acc866f40e9150e6ed050455b1415428979))
* expand aliases ([2cf102f](https://github.com/termyapp/Termy/commit/2cf102f4efcb1d2f51a9bf5e2d90cdd84c229f6d))
* linux path ([264aeaa](https://github.com/termyapp/Termy/commit/264aeaae23bb0755a07798b32727c4a2520c25c2))
* make sure paths starting with `.` are suggested ([aab2075](https://github.com/termyapp/Termy/commit/aab2075086c39bb58fb849799f0faa690903c4a9))
* only expand alias if valid path ([#80](https://github.com/termyapp/Termy/issues/80)) ([639fe3f](https://github.com/termyapp/Termy/commit/639fe3f68e6053c7de38f51cd4f4c674281a8f86))
* only suggest commands when value is empty ([14d95ea](https://github.com/termyapp/Termy/commit/14d95eab8abc3917ad159d83ef5d29555ff12b63))
* only surround paths ([659453d](https://github.com/termyapp/Termy/commit/659453d4cde375f4152b33f362c4361e3a08bf22))
* open external ([9c31eef](https://github.com/termyapp/Termy/commit/9c31eefa23f41ed254648a04cc70ea0938327ef8))
* prod tldr path ([92c2ee9](https://github.com/termyapp/Termy/commit/92c2ee94c0cb24db63744b07c988385313e8a6c2))
* remove default shortcuts value ([47f8d07](https://github.com/termyapp/Termy/commit/47f8d0799f69a89ada4f8820e624e9baa28c5fff))
* return results ([4e2f99d](https://github.com/termyapp/Termy/commit/4e2f99dade4a2d4d829bdb93f9af93c801b3ed90))
* run through diff on cross_path ([e238c26](https://github.com/termyapp/Termy/commit/e238c26508d076092c5fb4df99db18f42e71c234))
* suggestion errors ([6450760](https://github.com/termyapp/Termy/commit/645076019bdb1ae7bfa1cca6bd71dacd4facaa02))
* suggestion starting with a dot should account for existing dot ([e40cbe5](https://github.com/termyapp/Termy/commit/e40cbe5a0fa3412d771b7dd89392c959ad341396))
* surround external command args with quotes ([ebc2ac7](https://github.com/termyapp/Termy/commit/ebc2ac7e938a4ee9c2324dfbaffb6aded24f30d4)), closes [#80](https://github.com/termyapp/Termy/issues/80)
* surround only args with spaces in them ([fb22c47](https://github.com/termyapp/Termy/commit/fb22c477df617fc2c0d47ff502a4dd4cf0d57241))
* target_os ([9698005](https://github.com/termyapp/Termy/commit/96980050303b1792a8afbe5232788d8c96e0c8d4))
* tldr path ([227ecde](https://github.com/termyapp/Termy/commit/227ecdef795ea8b17a71af00a98a62bd53617c94))
* update api types ([34aa115](https://github.com/termyapp/Termy/commit/34aa11564d763d7c1deb67769ae20c1f1c55c0d9))


### Features

* cd using native dir select ([3347171](https://github.com/termyapp/Termy/commit/3347171436f7938bfe32a31fc4fa247246db8900))
* **xterm:** add link addon ([747266f](https://github.com/termyapp/Termy/commit/747266f27bad3f4c65478d6e58f453d098933405))
* add fallback `cd` command ([#9](https://github.com/termyapp/Termy/issues/9)) ([fd07dd2](https://github.com/termyapp/Termy/commit/fd07dd28e4339b57893897807ae5dece91caa763))
* add history struct ([4dd336e](https://github.com/termyapp/Termy/commit/4dd336ecf28acc7b3b51a5dd9da14b23394984d3))
* add middle click close ([0f47c7d](https://github.com/termyapp/Termy/commit/0f47c7d41cc0611c99b2125458b2edcbe43f8bee))
* bumpt prettier ([96d005f](https://github.com/termyapp/Termy/commit/96d005f1e17629b1a40ce7224d099d7be8faf6b0))
* command refactor ([d9f8010](https://github.com/termyapp/Termy/commit/d9f801098dc928a8237ada5ab28514e21e30ea55))
* history (works in dev) ([6c2fc66](https://github.com/termyapp/Termy/commit/6c2fc6652311fa49496e953dbd4002e7b2979a03))
* impl AsRef<Path> & canonicalize on display ([f65e45c](https://github.com/termyapp/Termy/commit/f65e45c52afc6e18cd0f22587a918b397652cdfb))
* parser ([87f68e7](https://github.com/termyapp/Termy/commit/87f68e7d82b157f7daaefc26b5ce47f8b5c8465b))
* react-from-json ([f1172a8](https://github.com/termyapp/Termy/commit/f1172a8b6e39108f169ee94b61992d70da0d6da2))
* rm Inter & use system sans fonts ([4bcae01](https://github.com/termyapp/Termy/commit/4bcae019c44d5d5b019d6ff399df792e2a05b52c))
* set up prod file logger ([dc9d97c](https://github.com/termyapp/Termy/commit/dc9d97cd10ea79baea0a5b61bab5a483251a3918))
* show pretty current dir and current branch ([1860c90](https://github.com/termyapp/Termy/commit/1860c90556bfea41081b9395022a1ee22d16c99b)), closes [#82](https://github.com/termyapp/Termy/issues/82)
* stop decoding base64 ([e44c436](https://github.com/termyapp/Termy/commit/e44c4366238eeb01a6c79579d0dc09f0e64b5d74))
* termy error ([a014682](https://github.com/termyapp/Termy/commit/a01468288cbe028866ed4a2fc584bb0faae401b1))


### Performance Improvements

* add ipc time measures ([a03ecd6](https://github.com/termyapp/Termy/commit/a03ecd65c6b05c9b9373652123fe7837f7614fe0))
* extract theme selector ([6754819](https://github.com/termyapp/Termy/commit/67548193fe3392105a5c5ebdb16f3f7ed3e2e359))
* make autocomplete async ([#19](https://github.com/termyapp/Termy/issues/19)) ([75c2f16](https://github.com/termyapp/Termy/commit/75c2f16220469a11b4d999c8a7df0959d1623a02))
* make history static using lazy static ([#19](https://github.com/termyapp/Termy/issues/19)) ([e6b316f](https://github.com/termyapp/Termy/commit/e6b316fff60c0973fcc7992eabc8a9b13ed73bcc))
* use hashmap ([11cae2a](https://github.com/termyapp/Termy/commit/11cae2af75d84bf597f8ac075bdd3c6104f6799f))
