import Router from "next/router";
import { destroyCookie, parseCookies } from "nookies";
import { ComponentType, useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { Permission } from "../types/users.type";

export const withAdminAndSindicoPermission = <T extends object>(
  WrappedComponent: ComponentType<T>
) => {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";
  const ComponentWith = (props: T) => {
    const { user } = useAuthContext();
    const [isAcess, setIsAcess] = useState(false);
    const { "focus-elevador-token": token } = parseCookies();

    useEffect(() => {
      if (token) {
        if (user) {
          if (
            user.permission === Permission.ADMIN ||
            user.permission === Permission.SINDICO
          ) {
            setIsAcess(true);
          } else {
            Router.replace("/dashboard");
          }
        }
      } else {
        destroyCookie(undefined, "focus-elevador-token", { path: "/" });
        Router.replace("/");
      }
    }, [user]);

    return isAcess ? <WrappedComponent {...(props as T)} /> : null;
  };

  ComponentWith.displayName = `withAdminAndSindicoPermission(${displayName})`;
  return ComponentWith;
};

export const withAllPermission = <T extends object>(
  WrappedComponent: ComponentType<T>
) => {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";
  const ComponentWith = (props: T) => {
    const { user } = useAuthContext();
    const [isAcess, setIsAcess] = useState(false);
    const { "focus-elevador-token": token } = parseCookies();

    useEffect(() => {
      if (token) {
        if (user) {
          if (
            [Permission.ADMIN, Permission.SINDICO, Permission.ZELADOR].includes(
              user.permission
            )
          ) {
            setIsAcess(true);
          } else {
            Router.replace("/dashboard");
          }
        }
      } else {
        destroyCookie(undefined, "focus-elevador-token", { path: "/" });
        Router.replace("/");
      }
    }, [user]);

    return isAcess ? <WrappedComponent {...(props as T)} /> : null;
  };

  ComponentWith.displayName = `withAdminAndSindicoPermission(${displayName})`;
  return ComponentWith;
};
