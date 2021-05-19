import * as React from 'react';
import {
    ColorValue,
    LayoutChangeEvent,
    LayoutRectangle,
    StyleSheet,
    View,
} from 'react-native';
import {
    NavigationState,
    Route,
    SceneMap,
    SceneRendererProps,
    TabBar,
    TabView,
} from 'react-native-tab-view';
import {
    UILabel,
    UILabelColors,
    UILabelRoles,
    useTheme,
    ColorVariants,
} from '@tonlabs/uikit.hydrogen';
import type {
    UIPagerViewContainerProps,
    UIPagerViewContainerType,
    UIPagerViewPageProps,
} from '../UIPagerView';

type SceneProps = SceneRendererProps & {
    route: Route;
};

type SceneList = {
    [key: string]: React.ComponentType<SceneProps>;
};

type SceneComponent = (props: SceneProps) => React.ReactNode;

type TabBarProps = SceneRendererProps & {
    navigationState: NavigationState<Route>;
};

type TabBarComponent = (props: TabBarProps) => React.ReactElement;

type LabelProps = {
    route: Route;
    focused: boolean;
};

const useRoutes = (
    pages: React.ReactElement<UIPagerViewPageProps>[],
): Route[] => {
    return React.useMemo(() => {
        return pages.map(
            (child: React.ReactElement<UIPagerViewPageProps>): Route => {
                return {
                    key: child.props.id,
                    title: child.props.title,
                };
            },
        );
    }, [pages]);
};

const getPages = (
    children: React.ReactNode,
): React.ReactElement<UIPagerViewPageProps>[] => {
    const childElements: React.ReactElement<
        UIPagerViewPageProps
    >[] = React.Children.toArray(children).reduce<
        React.ReactElement<UIPagerViewPageProps>[]
    >((acc, child) => {
        if (React.isValidElement(child)) {
            if (child.type === UIPagerViewPage) {
                return [...acc, child];
            }

            if (child.type === React.Fragment) {
                return [...acc, ...getPages(child.props.children)];
            }
        }
        if (__DEV__) {
            throw new Error(
                `UIPagerViewContainer can only contain 'UIPagerView.Page' components as its direct children (found ${
                    // eslint-disable-next-line no-nested-ternary
                    React.isValidElement(child)
                        ? `${
                              typeof child.type === 'string'
                                  ? child.type
                                  : child.type?.name
                          }`
                        : typeof child === 'object'
                        ? JSON.stringify(child)
                        : `'${String(child)}'`
                })`,
            );
        }
        return acc;
    }, []);

    return childElements;
};

const usePages = (
    children:
        | React.ReactElement<UIPagerViewPageProps>
        | React.ReactElement<UIPagerViewPageProps>[],
): React.ReactElement<UIPagerViewPageProps>[] => {
    return React.useMemo(() => {
        const pages: React.ReactElement<UIPagerViewPageProps>[] = getPages(
            children,
        );
        return pages;
    }, [children]);
};

const getSceneList = (
    pages: React.ReactElement<UIPagerViewPageProps>[],
): SceneList => {
    return pages.reduce(
        (
            sceneMap: SceneList,
            page: React.ReactElement<UIPagerViewPageProps>,
        ): SceneList => {
            return {
                ...sceneMap,
                [page.props.id]: page.props.component,
            };
        },
        {},
    );
};

const useScene = (
    pages: React.ReactElement<UIPagerViewPageProps>[],
): SceneComponent => {
    return React.useMemo(() => {
        return SceneMap(getSceneList(pages));
    }, [pages]);
};

const getLabelColor = (
    focused: boolean,
    page: React.ReactElement<UIPagerViewPageProps>,
): ColorVariants => {
    if (page.props.isDestructive) {
        return UILabelColors.TextNegative;
    }
    if (focused) {
        return UILabelColors.TextPrimary;
    }
    return UILabelColors.TextSecondary;
};

const renderLabel = (pages: React.ReactElement<UIPagerViewPageProps>[]) => (
    props: LabelProps,
): React.ReactElement<typeof UILabel> | null => {
    const currentPage:
        | React.ReactElement<UIPagerViewPageProps>
        | undefined = pages.find(
        (page: React.ReactElement<UIPagerViewPageProps>): boolean =>
            page.props.id === props.route.key,
    );

    if (!currentPage) {
        return null;
    }

    const color: ColorVariants = getLabelColor(props.focused, currentPage);

    return (
        <UILabel
            testID={`uiPagerView_label-${currentPage.props.testID}`}
            color={color}
            role={UILabelRoles.ActionCallout}
        >
            {props.route.title}
        </UILabel>
    );
};

const renderCenterTabBar = (
    props: TabBarProps,
    pages: React.ReactElement<UIPagerViewPageProps>[],
    indicatorColor: ColorValue,
    indicatorContainerColor: ColorValue,
): React.ReactElement => {
    return (
        <TabBar
            {...props}
            indicatorStyle={[
                styles.indicator,
                {
                    backgroundColor: indicatorColor,
                },
            ]}
            style={styles.centerTabBar}
            renderLabel={renderLabel(pages)}
            indicatorContainerStyle={[
                styles.indicatorContainer,
                {
                    backgroundColor: indicatorContainerColor,
                },
            ]}
        />
    );
};

const renderLeftTabBar = (
    props: TabBarProps,
    pages: React.ReactElement<UIPagerViewPageProps>[],
    indicatorColor: ColorValue,
    indicatorContainerColor: ColorValue,
): React.ReactElement => {
    return (
        <TabBar
            {...props}
            scrollEnabled
            pressColor="transparent"
            indicatorStyle={[
                styles.indicator,
                {
                    backgroundColor: indicatorColor,
                },
            ]}
            style={styles.leftTabBar}
            renderLabel={renderLabel(pages)}
            indicatorContainerStyle={[
                styles.indicatorContainer,
                {
                    backgroundColor: indicatorContainerColor,
                },
            ]}
            tabStyle={styles.leftTab}
        />
    );
};

const useTabBar = (
    pages: React.ReactElement<UIPagerViewPageProps>[],
    indicatorColor: ColorValue,
    indicatorContainerColor: ColorValue,
    type: UIPagerViewContainerType,
): TabBarComponent =>
    React.useCallback(
        (props: TabBarProps): React.ReactElement => {
            switch (type) {
                case 'Left':
                    return renderLeftTabBar(
                        props,
                        pages,
                        indicatorColor,
                        indicatorContainerColor,
                    );
                case 'Center':
                default:
                    return renderCenterTabBar(
                        props,
                        pages,
                        indicatorColor,
                        indicatorContainerColor,
                    );
            }
        },
        [pages, indicatorColor, indicatorContainerColor, type],
    );

export const UIPagerViewPage: React.FC<UIPagerViewPageProps> = () => null;

export const UIPagerViewContainer: React.FC<UIPagerViewContainerProps> = ({
    type,
    initialPageIndex = 0,
    onPageIndexChange,
    children,
    testID,
}: UIPagerViewContainerProps) => {
    const theme = useTheme();
    const [layout, setLayout] = React.useState<LayoutRectangle>({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const [currentIndex, setCurrentIndex] = React.useState<number>(
        initialPageIndex,
    );

    const onLayout: (event: LayoutChangeEvent) => void = React.useCallback(
        (event: LayoutChangeEvent) => {
            setLayout(event.nativeEvent.layout);
        },
        [],
    );

    React.useEffect(() => {
        if (onPageIndexChange) {
            onPageIndexChange(currentIndex);
        }
    }, [currentIndex, onPageIndexChange]);

    const pages: React.ReactElement<UIPagerViewPageProps>[] = usePages(
        children,
    );

    const routes: Route[] = useRoutes(pages);

    const renderScene: SceneComponent = useScene(pages);

    const renderTabBar: TabBarComponent = useTabBar(
        pages,
        theme.TextPrimary,
        theme.LinePrimary,
        type,
    );

    if (pages.length === 0) {
        console.error(
            `UIPagerViewContainer: children must have at least 1 item`,
        );
        return null;
    }

    return (
        <View onLayout={onLayout} style={styles.container} testID={testID}>
            <TabView<Route>
                navigationState={{ index: currentIndex, routes }}
                renderScene={renderScene}
                onIndexChange={setCurrentIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={renderTabBar}
                style={{
                    backgroundColor: theme.BackgroundPrimary,
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    indicator: {
        height: 1,
    },
    centerTabBar: {
        height: 72,
        backgroundColor: 'transparent',
        shadowColor: 'transparent',
        elevation: 0,
        justifyContent: 'center',
        marginHorizontal: 16,
    },
    indicatorContainer: {
        top: undefined,
        bottom: 16,
        height: 1,
    },
    leftTabBar: {
        height: 72,
        backgroundColor: 'transparent',
        shadowColor: 'transparent',
        elevation: 0,
        justifyContent: 'center',
        overflow: 'hidden',
        marginHorizontal: 16,
    },
    leftTab: {
        paddingHorizontal: 8,
        width: 'auto',
    },
});