import * as React from 'react';
import {
    TextInput,
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ColorValue,
} from 'react-native';

import { UIConstant } from '@tonlabs/uikit.core';
import { uiLocalized } from '@tonlabs/uikit.localization';
import {
    useTheme,
    ColorVariants,
    UILabel,
    UILabelColors,
    UILabelRoles,
} from '@tonlabs/uikit.hydrogen';

import { UIMaterialTextView } from './UIMaterialTextView';
import { PropsAwarePopover } from './PropsAwarePopover';
import { useAutogrowTextView } from './useAutogrowTextView';

type UISeedPhrasePopoverProps = {
    currentHighlightedItemIndex: number;
    hints: string[];
    onHintSelected: (item: string) => void;
    width: number;
};

function UISeedPhrasePopover(props: UISeedPhrasePopoverProps) {
    const { currentHighlightedItemIndex, hints, onHintSelected, width } = props;
    const theme = useTheme();
    const maxHintsToShow = Math.min(hints.length, MAX_CELLS);
    const height =
        hints.length > 0 ? UIConstant.defaultCellHeight() * maxHintsToShow : 0;
    // Calculate the padding bottom to view cells even if clipped
    const paddingBottom = UIConstant.defaultCellHeight() * (maxHintsToShow - 1);

    return (
        <View
            nativeID="hints-view"
            style={[
                styles.hintsContainer,
                {
                    height,
                    width,
                    backgroundColor: theme[ColorVariants.BackgroundPrimary],
                },
            ]}
        >
            <View style={styles.hintsInner}>
                <FlatList
                    contentContainerStyle={{ paddingBottom }}
                    scrollEnabled
                    showsVerticalScrollIndicator
                    keyExtractor={(item) => item}
                    keyboardShouldPersistTaps="handled"
                    data={hints}
                    extraData={currentHighlightedItemIndex}
                    renderItem={({ item, index }) => {
                        const cellBgStyle: {
                            backgroundColor: ColorValue;
                        } = {
                            backgroundColor:
                                theme[
                                    currentHighlightedItemIndex === index
                                        ? ColorVariants.BackgroundSecondary
                                        : ColorVariants.BackgroundPrimary
                                ],
                        };
                        return (
                            <TouchableOpacity
                                testID={`profile_backup_key_phrase_${item}`}
                                style={[styles.cellHint, cellBgStyle]}
                                onPressIn={() => {
                                    onHintSelected(item);
                                }}
                            >
                                <UILabel
                                    color={UILabelColors.TextSecondary}
                                    role={UILabelRoles.ParagraphNote}
                                >
                                    {item}
                                </UILabel>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </View>
    );
}

const MAX_CELLS = 3;
const SPLITTER = ` ${UIConstant.dashSymbol()} `;

const identifyWordThatChanged = (
    phrase: string,
    lastPhrase: string,
): [string, number] => {
    const currentWords = phrase.split(SPLITTER);
    const lastWords = lastPhrase.split(SPLITTER);

    for (
        let i = Math.max(currentWords.length, lastWords.length) - 1;
        i >= 0;
        i -= 1
    ) {
        if (
            lastWords[i] != null &&
            currentWords[i] != null &&
            lastWords[i] !== currentWords[i]
        ) {
            return [currentWords[i], i];
        }
    }

    return ['', -1];
};

const splitPhrase = (phrase: string) => {
    return phrase.split(SPLITTER);
};

type CurrentInnerState = {
    phrase: string;
    parts: string[];
    typed: {
        word: string;
        index: number;
    };
    highlight: {
        index: number;
    };
};

type SEPARATE_ACTION = {
    type: 'separate';
    payload: {
        phrase: string;
        parts?: string[];
    };
};
type REMOVE_SEPARATOR_ACTION = {
    type: 'remove_separator';
    payload: {
        phrase: string;
        parts?: string[];
    };
};
type SET_CURRENT_TYPED_ACTION = {
    type: 'set_currently_typed';
    payload: {
        phrase: string;
        parts?: string[];
    };
};
type CHANGE_HIGHLIGHTED_ACTION = {
    type: 'change_highlighted';
    payload: {
        index: number;
    };
};
type BLUR_ACTION = {
    type: 'blur';
};

type ACTION =
    | SEPARATE_ACTION
    | REMOVE_SEPARATOR_ACTION
    | SET_CURRENT_TYPED_ACTION
    | CHANGE_HIGHLIGHTED_ACTION
    | BLUR_ACTION;

const reducer = (
    state: CurrentInnerState,
    action: ACTION,
): CurrentInnerState => {
    if (action.type === 'separate') {
        return {
            ...state,
            phrase: action.payload.phrase,
            parts: action.payload.parts || splitPhrase(action.payload.phrase),
            typed: {
                word: '',
                index: -1,
            },
            highlight: {
                index: -1,
            },
        };
    }
    if (action.type === 'remove_separator') {
        return {
            ...state,
            phrase: action.payload.phrase,
            parts: action.payload.parts || splitPhrase(action.payload.phrase),
            highlight: {
                index: -1,
            },
        };
    }
    if (action.type === 'set_currently_typed') {
        const [currentWord, currentWordIndex] = identifyWordThatChanged(
            action.payload.phrase,
            state.phrase,
        );
        return {
            ...state,
            phrase: action.payload.phrase,
            parts: action.payload.parts || splitPhrase(action.payload.phrase),
            typed: {
                word: currentWord,
                index: currentWordIndex,
            },
        };
    }
    if (action.type === 'change_highlighted') {
        return {
            ...state,
            highlight: {
                index: action.payload.index,
            },
        };
    }
    if (action.type === 'blur') {
        return {
            ...state,
            highlight: {
                index: -1,
            },
        };
    }

    return state;
};

export type UISeedPhraseTextViewProps = {
    words: string[];
    totalWords: number | number[];
    validatePhrase: (phrase?: string, parts?: string[]) => Promise<boolean>;
    onSuccess: (phrase?: string, parts?: string[]) => void | Promise<void>;
    onSubmit: () => void | Promise<void>;
};

export const UISeedPhraseTextView = React.forwardRef<
    TextInput,
    UISeedPhraseTextViewProps
>(function UISeedPhraseTextViewForwarded(
    props: UISeedPhraseTextViewProps,
    ref,
) {
    const { words, validatePhrase, onSuccess, onSubmit } = props;
    const totalWords = React.useMemo(() => {
        if (typeof props.totalWords === 'number') {
            return [props.totalWords];
        }

        return props.totalWords;
    }, [props.totalWords]);

    const textInputRef = React.useRef(null);
    const refToUse = ref || textInputRef;

    const [state, dispatch] = React.useReducer(reducer, {
        phrase: '',
        parts: [],
        typed: {
            word: '',
            index: -1,
        },
        highlight: {
            index: -1,
        },
    });
    // https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback
    const phraseRef = React.useRef('');
    const phrasePartsRef = React.useRef<string[] | null>(null);

    const dispatchAndSavePhrase = React.useCallback((action: ACTION) => {
        if (
            'payload' in action &&
            action.payload != null &&
            'phrase' in action.payload
        ) {
            phraseRef.current = action.payload.phrase;
            phrasePartsRef.current = splitPhrase(action.payload.phrase);
            // eslint-disable-next-line no-param-reassign
            action.payload.parts = phrasePartsRef.current;
        }

        dispatch(action);
    }, []);

    const [isFocused, setIsFocused] = React.useState(false);

    const onFocus = React.useCallback(() => {
        setIsFocused(true);
    }, [setIsFocused]);

    const onBlur = React.useCallback(() => {
        // To handle taps on hints we need to delay handling a bit
        // to get a room for event to fire (at least on web)
        // or with isFocused == true hints will be re-rendered before click occur
        setTimeout(() => {
            // in onHintSelected method we call .focus() to continue typing
            // so it means we don't need to handle blur event anymore
            if (
                refToUse &&
                'current' in refToUse &&
                refToUse.current?.isFocused()
            ) {
                return;
            }
            dispatch({
                type: 'blur',
            });
            setIsFocused(false);
        }, 50);
    }, [refToUse]);

    const {
        onContentSizeChange,
        onChange,
        inputHeight,
        numberOfLines,
        numberOfLinesProp,
    } = useAutogrowTextView(refToUse);

    const hints = React.useMemo(() => {
        if (!isFocused) {
            return [];
        }
        if (state.typed.word.length === 0) {
            return [];
        }
        const filtered = words.filter(
            (word) => word.indexOf(state.typed.word) === 0,
        );

        // Do not show hint if it consist of the typed word itself
        if (filtered.length === 1 && filtered[0] === state.typed.word) {
            return [];
        }

        return filtered;
    }, [words, state.typed.word, isFocused]);

    const onHintSelected = React.useCallback(
        (item: string) => {
            const parts = phrasePartsRef.current
                ? [...phrasePartsRef.current]
                : [];

            parts[state.typed.index] = item;

            let newText = parts.join(SPLITTER);

            if (
                state.typed.index === parts.length - 1 &&
                totalWords.indexOf(parts.length) === -1
            ) {
                newText = `${newText}${SPLITTER}`;
            }

            if (refToUse && 'current' in refToUse) {
                refToUse.current?.setNativeProps({
                    text: newText,
                });
                refToUse.current?.focus();

                // On web onChange isn't fired, so we need to force it
                onChange && onChange();
            }

            dispatchAndSavePhrase({
                type: 'separate',
                payload: {
                    phrase: newText,
                },
            });
        },
        [
            totalWords,
            state.typed.index,
            onChange,
            dispatchAndSavePhrase,
            refToUse,
        ],
    );

    const onKeyPress = React.useCallback(
        (e: any) => {
            const event = e.nativeEvent;

            if (event.key === 'ArrowUp') {
                e.preventDefault();
                dispatch({
                    type: 'change_highlighted',
                    payload: {
                        index: Math.max(state.highlight.index - 1, 0),
                    },
                });

                return;
            }
            if (event.key === 'ArrowDown') {
                e.preventDefault();
                dispatch({
                    type: 'change_highlighted',
                    payload: {
                        index: Math.min(
                            state.highlight.index + 1,
                            hints.length - 1,
                        ),
                    },
                });

                return;
            }
            if (event.key === 'Enter' && state.highlight.index >= 0) {
                e.preventDefault();
                onHintSelected(hints[state.highlight.index]);
            }
        },
        [hints, state.highlight.index, onHintSelected],
    );

    const onChangeText = React.useCallback(
        (text: string) => {
            const lastSymbol = text[text.length - 1];

            if (text.length > phraseRef.current.length && lastSymbol === ' ') {
                // Prevent adding dash when there wasn't typed a word
                // i.e `word - - `
                if (text.endsWith('  ')) {
                    if (refToUse && 'current' in refToUse) {
                        refToUse.current?.setNativeProps({
                            text: phraseRef.current,
                        });
                    }
                    return;
                }
                const parts = text.split(SPLITTER);
                const newText =
                    parts.length < Math.max.apply(null, totalWords)
                        ? `${text}${UIConstant.dashSymbol()} `
                        : text.trim();

                if (refToUse && 'current' in refToUse) {
                    refToUse.current?.setNativeProps({
                        text: newText,
                    });
                    onChange && onChange();
                }

                dispatchAndSavePhrase({
                    type: 'separate',
                    payload: { phrase: newText },
                });

                return;
            }

            if (
                text.length < phraseRef.current.length &&
                lastSymbol === UIConstant.dashSymbol()
            ) {
                const newText = text.slice(0, text.length - 2);

                if (refToUse && 'current' in refToUse) {
                    refToUse.current?.setNativeProps({
                        text: newText,
                    });
                    onChange && onChange();
                }

                dispatchAndSavePhrase({
                    type: 'remove_separator',
                    payload: { phrase: newText },
                });

                return;
            }

            const newText = text.match(/(\w+)/g)?.join(SPLITTER) ?? '';

            if (newText !== text && refToUse && 'current' in refToUse) {
                refToUse.current?.setNativeProps({
                    text: newText,
                });
                onChange && onChange();
            }

            dispatchAndSavePhrase({
                type: 'set_currently_typed',
                payload: { phrase: newText },
            });
        },
        [totalWords, onChange, dispatchAndSavePhrase, refToUse],
    );

    const [isValid, setIsValid] = React.useState(false);

    // To not call validation at every prop change
    // (and prevent infinite cycles)
    const validatePhraseRef = React.useRef(validatePhrase);
    const onSuccessRef = React.useRef(onSuccess);
    React.useEffect(() => {
        validatePhraseRef.current = validatePhrase;
        onSuccessRef.current = onSuccess;
    }, [validatePhrase, onSuccess]);

    React.useEffect(() => {
        validatePhraseRef.current(state.phrase, state.parts).then((valid) => {
            setIsValid(valid);
            if (valid) {
                onSuccessRef.current(state.phrase, state.parts);
            }
        });
    }, [isValid, setIsValid, state.phrase, state.parts, refToUse]);

    const onSubmitEditing = React.useCallback(() => {
        if (refToUse && 'current' in refToUse) {
            refToUse.current?.setNativeProps({
                text: phraseRef.current,
            });
        }
        if (isValid) {
            onSubmit && onSubmit();
        }
    }, [isValid, onSubmit, refToUse]);

    const totalWordsString = React.useMemo(() => {
        if (typeof props.totalWords === 'number') {
            return uiLocalized.localizedStringForValue(
                props.totalWords,
                'words',
            );
        }

        const lastIndex = props.totalWords.length - 1;
        return props.totalWords.reduce((acc, num, index) => {
            if (index === lastIndex) {
                return `${acc}${uiLocalized.localizedStringForValue(
                    num,
                    'words',
                )}`;
            }

            return `${acc}${num}${uiLocalized.orDelimeter}`;
        }, '');
    }, [props.totalWords]);

    const hasValue = state.phrase.length > 0;

    const [helperText, error] = React.useMemo(() => {
        const entered = state.parts.filter((w) => w.length > 0).length;

        if (!isFocused && hasValue) {
            if (isValid) {
                return [uiLocalized.greatMemory, false];
            }
            return [uiLocalized.seedPhraseTypo, true];
        }

        if (entered === 0) {
            return [totalWordsString, false];
        }

        return [uiLocalized.localizedStringForValue(entered, 'words'), false];
    }, [isFocused, isValid, hasValue, state.parts, totalWordsString]);

    const [inputWidth, setInputWidth] = React.useState(0);

    const onInputLayout = React.useCallback(
        ({
            nativeEvent: {
                layout: { width },
            },
        }) => {
            setInputWidth(width);
        },
        [setInputWidth],
    );

    const popoverProps = React.useMemo(
        () => ({
            currentHighlightedItemIndex: state.highlight.index,
            hints,
            onHintSelected,
            width: inputWidth,
        }),
        [state.highlight.index, hints, onHintSelected, inputWidth],
    );

    const inputStyle = React.useMemo(
        () => [styles.input, { height: inputHeight }],
        [inputHeight],
    );

    return (
        <>
            <UIMaterialTextView
                ref={refToUse}
                autoCapitalize="none"
                autoCompleteType="off"
                autoCorrect={false}
                multiline
                label={uiLocalized.MasterPassword}
                onLayout={onInputLayout}
                onChangeText={onChangeText}
                onKeyPress={onKeyPress}
                onFocus={onFocus}
                onBlur={onBlur}
                onContentSizeChange={onContentSizeChange}
                onChange={onChange}
                numberOfLines={numberOfLinesProp}
                style={inputStyle}
                helperText={helperText}
                error={error}
                success={isValid && !isFocused}
                returnKeyType="done"
                onSubmitEditing={onSubmitEditing}
                blurOnSubmit
            />
            <PropsAwarePopover
                // if number of lines changed, redraw it
                key={numberOfLines}
                placement="bottom"
                arrowWidth={0}
                arrowHeight={0}
                isVisible={hints.length > 0}
                component={UISeedPhrasePopover}
                componentProps={popoverProps}
            >
                <View />
            </PropsAwarePopover>
        </>
    );
});

const styles = StyleSheet.create({
    input: {
        minHeight: UIConstant.smallCellHeight(),
    },
    hintsContainer: {
        flex: 1,
        marginTop: -16, // Don't want to calculate it dinamically, seems to work fine
        ...UIConstant.cardShadow(),
        borderBottomLeftRadius: UIConstant.borderRadius(),
        borderBottomRightRadius: UIConstant.borderRadius(),
    },
    hintsInner: {
        flex: 1,
        overflow: 'hidden',
        borderBottomLeftRadius: UIConstant.borderRadius(),
        borderBottomRightRadius: UIConstant.borderRadius(),
    },
    cellHint: {
        zIndex: 1,
        justifyContent: 'center',
        paddingHorizontal: UIConstant.contentOffset(),
        minHeight: UIConstant.defaultCellHeight(),
    },
});