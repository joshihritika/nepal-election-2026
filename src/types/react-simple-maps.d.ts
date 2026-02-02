declare module "react-simple-maps" {
  import { ComponentType, ReactNode, CSSProperties } from "react";

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: {
      center?: [number, number];
      rotate?: [number, number, number];
      scale?: number;
    };
    width?: number;
    height?: number;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    onMoveStart?: (event: { coordinates: [number, number]; zoom: number }) => void;
    onMove?: (event: { coordinates: [number, number]; zoom: number }) => void;
    onMoveEnd?: (event: { coordinates: [number, number]; zoom: number }) => void;
    children?: ReactNode;
  }

  export interface GeographiesProps {
    geography: string | object;
    parseGeographies?: (geographies: object[]) => object[];
    children: (props: { geographies: GeographyType[] }) => ReactNode;
  }

  export interface GeographyType {
    rsmKey: string;
    properties: Record<string, unknown>;
    geometry: object;
  }

  export interface GeographyStyleProps {
    default?: CSSProperties;
    hover?: CSSProperties;
    pressed?: CSSProperties;
  }

  export interface GeographyProps {
    geography: GeographyType;
    style?: GeographyStyleProps;
    className?: string;
    onClick?: (event: React.MouseEvent) => void;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    onMouseMove?: (event: React.MouseEvent) => void;
    onFocus?: (event: React.FocusEvent) => void;
    onBlur?: (event: React.FocusEvent) => void;
  }

  export interface MarkerProps {
    coordinates: [number, number];
    style?: GeographyStyleProps;
    className?: string;
    onClick?: (event: React.MouseEvent) => void;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    children?: ReactNode;
  }

  export interface LineProps {
    from: [number, number];
    to: [number, number];
    stroke?: string;
    strokeWidth?: number;
    strokeLinecap?: string;
    style?: GeographyStyleProps;
    className?: string;
  }

  export interface AnnotationProps {
    subject: [number, number];
    dx?: number;
    dy?: number;
    connectorProps?: object;
    curve?: number;
    children?: ReactNode;
  }

  export interface GraticuleProps {
    stroke?: string;
    strokeWidth?: number;
    step?: [number, number];
    className?: string;
  }

  export interface SphereProps {
    id?: string;
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    className?: string;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const Line: ComponentType<LineProps>;
  export const Annotation: ComponentType<AnnotationProps>;
  export const Graticule: ComponentType<GraticuleProps>;
  export const Sphere: ComponentType<SphereProps>;
}
