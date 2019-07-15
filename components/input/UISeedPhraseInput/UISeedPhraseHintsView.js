// @flow
import React from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';

import Mnemonic from 'bitcore-mnemonic';

import UIColor from '../../../helpers/UIColor';
import UIConstant from '../../../helpers/UIConstant';

import UIComponent from '../../UIComponent';
import UILabel from '../../text/UILabel';

import type { EventProps } from '../../../types';

type Props = {
    width: number,
    onHintSelected: (hint: string) => void,
};

type State = {
    wordThatChanged: string,
    currentHighlight: number,
};

const styles = StyleSheet.create({
    hintsContainer: {
        flex: 1,
        maxHeight: UIConstant.defaultCellHeight() * 3,
        backgroundColor: UIColor.backgroundPrimary(),
        ...UIConstant.cardShadow(),
        borderBottomLeftRadius: UIConstant.borderRadius(),
        borderBottomRightRadius: UIConstant.borderRadius(),
    },
    cellHint: {
        zIndex: 1,
        justifyContent: 'center',
        paddingHorizontal: UIConstant.contentOffset(),
        minHeight: UIConstant.defaultCellHeight(),
        borderBottomLeftRadius: UIConstant.borderRadius(),
        borderBottomRightRadius: UIConstant.borderRadius(),
    },
    cellHintNormal: {
        backgroundColor: UIColor.backgroundPrimary(),
    },
    cellHintSelected: {
        backgroundColor: UIColor.notWhite(),
    },
});

export default class UISeedPhraseHintsView extends UIComponent<Props, State> {
    static defaultProps = {
        width: 0,
        onHintSelected: () => {},
    };

    currentHintsLength: number;
    hintsListRef: ?FlatList<*>;
    wordChanged: (wordThatChanged: string) => void;

    constructor(props: Props) {
        super(props);

        this.currentHintsLength = 0;
        this.hintsListRef = null;

        this.state = {
            wordThatChanged: '',
            currentHighlight: -1,
        };
    }

    // Setters
    setCurrentHighligh(index: number) {
        this.setStateSafely({ currentHighlight: index });
    }

    // Getters
    getPossibleHints(): Array<string> {
        const wtc = this.getWordThatChanged();
        const dictionary = Mnemonic.Words.ENGLISH;
        const hints = dictionary.filter(word => word.startsWith(wtc));
        this.currentHintsLength = hints.length;
        return hints;
    }

    getWordThatChanged(): string {
        return this.state.wordThatChanged;
    }

    getWidth() {
        return this.props.width;
    }

    getCurrentHighligh(): number {
        return this.state.currentHighlight;
    }

    // Events
    onKeyPress = (e: any): void => {
        const event = e.nativeEvent;

        let c = this.getCurrentHighligh();
        if (this.currentHintsLength > 0) {
            if (event.key === 'ArrowUp') {
                c = c - 1 < 0 ? this.currentHintsLength - 1 : c - 1;
            } else if (event.key === 'ArrowDown') {
                c = c + 1 >= this.currentHintsLength ? 0 : c + 1;
            } else if (event.key === 'Enter' && c >= 0) {
                const hints = this.getPossibleHints();
                const word = `${hints[c]}`;
                this.onHintSelected(word);
                c = -1;
            }
        }

        this.setCurrentHighligh(c);
        if (c >= 0 && this.hintsListRef) {
            this.hintsListRef.scrollToIndex({ animated: true, index: c, viewPosition: 1 });
        }
    };

    onHintSelected(hint: string) {
        if (this.props.onHintSelected) {
            this.props.onHintSelected(hint);
        }
    }

    onMouseIn(index: number) {
        this.setCurrentHighligh(index);
    }

    onMouseOut() {
        this.setCurrentHighligh(-1);
    }

    // methods
    splitPhrase(phrase: string): Array<string> {
        const noExtraSpaces = phrase.replace(/\s+/g, ' ');
        const words = noExtraSpaces.split(' ');
        const normalized = [];

        for (let i = 0; i < words.length; i += 1) {
            if (i === 0 && words[0] === '') {
                continue;
            }

            if (words[i] !== UIConstant.dashSymbol() && words[i] !== '-') {
                normalized.push(words[i]);
            }
        }

        return normalized;
    }

    wordChanged = (wordThatChanged: string) => {
        this.setStateSafely({
            wordThatChanged,
            currentHighlight: -1, // deselect
        });
    }

    // Render
    renderHint(index: number, hint: string) {
        const eventProps: EventProps = {
            onMouseEnter: () => this.onMouseIn(index),
            onMouseLeave: () => this.onMouseOut(),
        };

        const ch = this.getCurrentHighligh();
        const cellType = ch === index ? styles.cellHintSelected : styles.cellHintNormal;
        return (
            <TouchableOpacity
                style={[styles.cellHint, cellType]}
                onPress={() => this.onHintSelected(hint)}
                {...eventProps}
            >
                <UILabel
                    text={hint}
                    role={UILabel.Role.Note}
                />
            </TouchableOpacity>
        );
    }

    render() {
        const hints = this.getPossibleHints();
        const wtc = this.getWordThatChanged();
        const width = this.getWidth();
        if (hints.length === 0 || (hints.length === 1 && hints[0] === wtc) || !width) {
            return <View />;
        }
        return (
            <View style={[styles.hintsContainer, { width }]}>
                <FlatList
                    ref={(ref) => { this.hintsListRef = ref; }}
                    data={hints}
                    style={{ width }}
                    renderItem={({ item, index }) => this.renderHint(index, item)}
                    scrollEnabled
                    showsVerticalScrollIndicator
                    keyExtractor={item => item}
                    keyboardShouldPersistTaps="handled"
                />
            </View>
        );
    }
}
